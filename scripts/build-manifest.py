"""
Adds the Majmar settings and home blocks to twilight.json.

Run from the theme root:  python scripts/build-manifest.py
It is idempotent: entries whose id / path start with `na` are replaced, Raed's are kept.
Labels are bilingual strings ("العربية · English") because the dashboard documents
`label` as a string; block titles and the theme name use the documented { ar, en } form.
"""
import json
import io
import uuid

PATH = 'twilight.json'


def L(ar, en):
    return f'{ar} · {en}'


def title(id_, ar, en):
    return {'id': id_, 'type': 'static', 'format': 'title', 'value': L(ar, en), 'variant': 'h6'}


def line(id_):
    return {'id': id_, 'type': 'static', 'format': 'line'}


def switch(id_, ar, en, value, desc=None):
    s = {'id': id_, 'type': 'boolean', 'format': 'switch', 'label': L(ar, en), 'required': False, 'value': value, 'selected': value}
    if desc:
        s['description'] = desc
    return s


def drop(id_, ar, en, options, default, desc=None):
    s = {
        'id': id_,
        'type': 'items',
        'format': 'dropdown-list',
        'label': L(ar, en),
        'required': False,
        'options': [{'label': L(a, e), 'value': v} for v, a, e in options],
        'selected': [next({'label': L(a, e), 'value': v} for v, a, e in options if v == default)],
        'value': default,
    }
    if desc:
        s['description'] = desc
    return s


def textf(id_, ar, en, value='', fmt='text', ml=False, desc=None, cond=None):
    s = {'id': id_, 'type': 'string', 'format': fmt, 'label': L(ar, en), 'required': False, 'value': value or None}
    if ml:
        s['multilanguage'] = True
    if desc:
        s['description'] = desc
    if cond:
        s['conditions'] = cond
    return s


def color(id_, ar, en, value, cond):
    return {'id': id_, 'type': 'string', 'format': 'color', 'label': L(ar, en), 'required': False, 'value': value, 'conditions': cond}


def number(id_, ar, en, value, cond=None):
    s = {'id': id_, 'type': 'number', 'format': 'integer', 'label': L(ar, en), 'required': False, 'value': value}
    if cond:
        s['conditions'] = cond
    return s


CUSTOM = [{'id': 'mj_custom_colors', 'operation': '=', 'value': True}]
WA = [{'id': 'mj_whatsapp_enabled', 'operation': '=', 'value': True}]
ANN = [{'id': 'mj_announcement_enabled', 'operation': '=', 'value': True}]
SPIN = [{'id': 'mj_pdp_360', 'operation': '=', 'value': True}]

SETTINGS = [
    title('mj-g-branding', 'مِجمر: الهوية', 'Majmar: Branding'),
    drop('mj_palette', 'لوحة الألوان', 'Palette', [('emerald', 'زمردي وذهبي', 'Emerald and gold'), ('oxblood', 'عنابي وذهبي', 'Oxblood and gold')], 'emerald'),
    drop('mj_accent_source', 'لون التمييز', 'Accent colour', [('amber', 'كهرماني', 'Amber gold'), ('store', 'لون المتجر الأساسي', 'Store primary colour')], 'amber'),
    drop('mj_fonts', 'الخطوط', 'Fonts', [('majmar', 'خطوط مِجمر (المسيري، ريدكس برو، فراونسس)', 'Majmar fonts (El Messiri, Readex Pro, Fraunces)'), ('store', 'خط المتجر من لوحة التحكم', 'Store font from the dashboard')], 'majmar'),
    switch('mj_custom_colors', 'ألوان مخصصة', 'Custom colours', False, 'Override the palette colours below. Keep text-to-background contrast at 4.5:1 or more.'),
    color('mj_color_bg', 'الخلفية', 'Background', '#F6F1E7', CUSTOM),
    color('mj_color_surface', 'الأسطح والبطاقات', 'Surfaces and cards', '#FFFFFF', CUSTOM),
    color('mj_color_gold', 'اللون الكهرماني', 'Amber accent', '#BE9650', CUSTOM),
    color('mj_color_text', 'لون النص', 'Text colour', '#0E2A22', CUSTOM),
    line('mj-l-1'),
    title('mj-g-header', 'مِجمر: الترويسة', 'Majmar: Header'),
    switch('mj_announcement_enabled', 'شريط الإعلان', 'Announcement bar', True),
    textf('mj_announcement_text', 'نص الإعلان', 'Announcement text', '', ml=True, cond=ANN),
    textf('mj_announcement_link', 'رابط الإعلان', 'Announcement link', '', fmt='url', cond=ANN),
    switch('mj_header_transparent', 'ترويسة شفافة فوق الواجهة الرئيسية', 'Transparent header over the home hero', True, 'Turns to frosted glass on scroll.'),
    line('mj-l-2'),
    title('mj-g-card', 'مِجمر: بطاقة المنتج', 'Majmar: Product card'),
    drop('mj_card_hover', 'تأثير التمرير', 'Hover effect', [('tilt', 'إمالة ثلاثية الأبعاد مع لمعة كهرمانية', '3D tilt with amber edge light'), ('zoom', 'تكبير هادئ', 'Soft zoom'), ('none', 'بدون', 'None')], 'tilt'),
    drop('mj_card_badge', 'شكل الشارات', 'Badge style', [('outline', 'إطار كهرماني', 'Amber outline'), ('solid', 'ممتلئ', 'Solid')], 'outline'),
    switch('mj_card_quick_add', 'زر الإضافة السريعة', 'Quick add button', True),
    switch('mj_card_second_image', 'إظهار الصورة الثانية عند التمرير', 'Show second image on hover', True),
    line('mj-l-3'),
    title('mj-g-pdp', 'مِجمر: صفحة المنتج', 'Majmar: Product page'),
    switch('mj_pdp_sticky_box', 'تثبيت صندوق الشراء (سطح المكتب)', 'Sticky buy box (desktop)', True),
    switch('mj_pdp_360', 'عرض 360 درجة', '360° view', False, 'When a product has at least the number of images below, shoppers can spin through them as a 360° sequence. Upload frames in order.'),
    number('mj_pdp_360_min_frames', 'أقل عدد من الصور للعرض 360', 'Minimum frames for 360°', 24, SPIN),
    line('mj-l-4'),
    title('mj-g-footer', 'مِجمر: التذييل', 'Majmar: Footer'),
    switch('mj_footer_payments', 'إظهار وسائل الدفع', 'Show payment methods', True),
    textf('mj_footer_tagline', 'عبارة التذييل', 'Footer tagline', '', ml=True),
    line('mj-l-5'),
    title('mj-g-social', 'مِجمر: التواصل', 'Majmar: Social'),
    switch('mj_whatsapp_enabled', 'زر واتساب العائم', 'Floating WhatsApp button', False),
    textf('mj_whatsapp_number', 'رقم واتساب مع رمز الدولة', 'WhatsApp number with country code', '', cond=WA, desc='Example: 9665XXXXXXXX'),
    textf('mj_whatsapp_message', 'رسالة افتتاحية', 'Opening message', '', ml=True, cond=WA),
    textf('mj_instagram_url', 'رابط إنستغرام', 'Instagram URL', '', fmt='url'),
    textf('mj_tiktok_url', 'رابط تيك توك', 'TikTok URL', '', fmt='url'),
    textf('mj_snapchat_url', 'رابط سناب شات', 'Snapchat URL', '', fmt='url'),
    textf('mj_x_url', 'رابط إكس', 'X URL', '', fmt='url'),
    line('mj-l-6'),
    title('mj-g-advanced', 'مِجمر: متقدم', 'Majmar: Advanced'),
    drop('mj_motion', 'شدة الحركة', 'Motion intensity', [('cinematic', 'سينمائية', 'Cinematic'), ('subtle', 'هادئة', 'Subtle'), ('off', 'إيقاف', 'Off')], 'cinematic', 'Visitors who ask their device for reduced motion always get the calm version.'),
    switch('mj_cookie_notice', 'تنبيه ملفات الارتباط', 'Cookie notice', True),
]


def bf(id_, type_, ar, en, **kw):
    """A home block field."""
    f = {'id': id_, 'type': type_, 'label': L(ar, en), 'required': kw.pop('required', False)}
    f.update(kw)
    return f


def btext(id_, ar, en, fmt='text', ml=True, **kw):
    return bf(id_, 'string', ar, en, format=fmt, multilanguage=ml, value=None, **kw)


def bimg(id_, ar, en, desc=None):
    f = bf(id_, 'string', ar, en, format='image', value=None)
    if desc:
        f['description'] = desc
    return f


def burl(id_, ar, en):
    return bf(id_, 'string', ar, en, format='url', value=None)


def bdrop(id_, ar, en, options, default):
    opts = [{'label': L(a, e), 'value': v} for v, a, e in options]
    return bf(id_, 'items', ar, en, format='dropdown-list', multichoice=False, options=opts, selected=[o for o in opts if o['value'] == default], value=default)


def coll(id_, ar, en, fields, mn, mx, item_label):
    for f in fields:
        f['id'] = f'{id_}.{f["id"]}'
    return bf(id_, 'collection', ar, en, format='collection', fields=fields, minLength=mn, maxLength=mx, item_label=item_label, value=[])


def block(key, path, ar, en, icon, fields):
    return {'key': key, 'title': {'ar': ar, 'en': en}, 'icon': icon, 'path': f'home.{path}', 'fields': fields}


# Stable keys so re-running keeps merchant block instances valid.
K = {p: str(uuid.uuid5(uuid.NAMESPACE_URL, f'majmar/{p}')) for p in ['mj-hero', 'mj-marquee', 'mj-film', 'mj-collections', 'mj-showcase', 'mj-story', 'mj-lookbook', 'mj-testimonials', 'mj-social', 'mj-newsletter', 'mj-trust']}

COMPONENTS = [
    block(K['mj-hero'], 'mj-hero', 'مِجمر: الواجهة السينمائية', 'Majmar: Cinematic Hero', 'sicon-image', [
        btext('overline', 'شارة تمهيدية', 'Eyebrow badge'),
        btext('title', 'العنوان', 'Headline'),
        btext('highlight', 'كلمة مميزة من العنوان', 'Highlighted word from the headline', description='Must appear in the headline exactly as typed. It is drawn in cream with an ink outline.'),
        btext('subtitle', 'وصف قصير', 'Short description', fmt='textarea'),
        btext('giant', 'الكلمة الكبيرة في الخلفية', 'Giant background word', description='One short word, drawn as a large outline behind the hero. Example: عود'),
        bf('products', 'items', 'منتج ملصق السعر', 'Product on the price sticker', format='dropdown-list', source='products', multichoice=False, searchable=True, options=[], selected=[], value=None,
           description='Its name and price show on the sticker, linked to the product. Empty: your latest product.'),
        btext('sticker', 'نص الملصق الدائري (اختياري)', 'Round sticker text (optional)', description='Leave empty for no round sticker.'),
        btext('sticker_badge', 'كلمة وسط الملصق', 'Word in the sticker centre'),
        bf('frames_url', 'string', 'رابط إطارات التدوير مع {n}', 'Turntable frame URL with {n}', format='url', value=None,
           description='Your own 360° turn of the product: https://cdn.example.com/spin/frame-{n}.webp, numbered 0001, 0002 ... Square frames on the same background colour. Empty: the bottle that ships with the theme.'),
        bf('frames_count', 'number', 'عدد إطارات التدوير', 'Number of turntable frames', format='integer', value=0, description='24 to 72 frames for one full turn.'),
        bimg('image', 'أو صورة ثابتة للمنتج', 'Or a still product image', '1100×1100 px, product on a plain background. Replaces the turntable.'),
        bimg('mobile_image', 'صورة الجوال (اختياري)', 'Mobile image (optional)', '720×900 px recommended.'),
        btext('cta_primary_text', 'نص الزر الرئيسي', 'Primary button text'),
        burl('cta_primary_url', 'رابط الزر الرئيسي', 'Primary button link'),
        btext('cta_secondary_text', 'نص الزر الثانوي', 'Secondary button text'),
        burl('cta_secondary_url', 'رابط الزر الثانوي', 'Secondary button link'),
    ]),
    block(K['mj-marquee'], 'mj-marquee', 'مِجمر: شريط النوتات المتحرك', 'Majmar: Scent Marquee', 'sicon-text', [
        btext('words', 'الكلمات (افصل بينها بفاصلة)', 'Words (separate with commas)', description='Example: عود, عنبر, مسك أبيض, ورد الطائف'),
    ]),
    block(K['mj-film'], 'mj-film', 'مِجمر: فيلم المنتج بالتمرير', 'Majmar: Scroll Product Film', 'sicon-image-carousel', [
        btext('overline', 'سطر تمهيدي', 'Overline'),
        btext('title', 'العنوان', 'Title'),
        coll('chapters', 'الفصول', 'Chapters', [
            btext('title', 'العنوان', 'Title'),
            btext('text', 'النص', 'Text', fmt='textarea'),
        ], 0, 5, L('فصل', 'Chapter')),
        bf('product', 'items', 'المنتج المعروض في النهاية', 'Product shown at the end', format='dropdown-list', source='products', multichoice=False, searchable=True, options=[], selected=[], value=None),
        btext('buy_overline', 'سطر فوق اسم المنتج', 'Line above the product name'),
        bf('frames_url', 'string', 'رابط إطارات الفيلم مع {n}', 'Frame sequence URL with {n}', format='url', value=None,
           description='Example: https://cdn.example.com/film/frame-{n}.webp (numbered 0001, 0002 ...). Leave empty to play the film that ships with the theme.'),
        bf('frames_count', 'number', 'عدد الإطارات', 'Number of frames', format='integer', value=0),
        burl('video', 'أو رابط فيديو MP4', 'Or MP4 video URL'),
        bdrop('length', 'طول الفيلم', 'Film length', [('short', 'قصير', 'Short'), ('medium', 'متوسط', 'Medium'), ('long', 'طويل', 'Long')], 'long'),
        bdrop('tone', 'إضاءة إطاراتك أو الفيديو', 'Your frames or video are', [('dark', 'داكنة: نص فاتح', 'Dark: light text'), ('bright', 'فاتحة: نص داكن', 'Bright: dark text')], 'dark'),
    ]),
    block(K['mj-collections'], 'mj-collections', 'مِجمر: المجموعات المختارة', 'Majmar: Featured Collections', 'sicon-layout-grid', [
        btext('overline', 'سطر تمهيدي', 'Overline'),
        btext('title', 'العنوان', 'Title'),
        coll('items', 'المجموعات', 'Collections', [
            bimg('image', 'الصورة', 'Image', '1200×1500 px recommended.'),
            btext('title', 'الاسم', 'Name'),
            btext('caption', 'وصف قصير', 'Caption'),
            burl('url', 'الرابط', 'Link'),
        ], 0, 6, L('مجموعة', 'Collection')),
    ]),
    block(K['mj-showcase'], 'mj-showcase', 'مِجمر: عرض المنتجات', 'Majmar: Product Showcase', 'sicon-store', [
        btext('overline', 'سطر تمهيدي', 'Overline'),
        btext('title', 'العنوان', 'Title'),
        bf('products', 'items', 'منتجات مختارة', 'Selected products', format='dropdown-list', source='products', multichoice=True, searchable=True, options=[], selected=[], value=[]),
        bf('category', 'items', 'أو تصنيف', 'Or a category', format='dropdown-list', source='categories', multichoice=False, searchable=True, options=[], selected=[], value=None),
        btext('link_text', 'نص رابط عرض الكل', 'View all text'),
        burl('link_url', 'رابط عرض الكل', 'View all link'),
    ]),
    block(K['mj-story'], 'mj-story', 'مِجمر: قصة العلامة', 'Majmar: Brand Story', 'sicon-book-open', [
        bimg('image', 'الصورة', 'Image', '1200×1500 px recommended.'),
        btext('overline', 'سطر تمهيدي', 'Overline'),
        btext('title', 'العنوان', 'Title'),
        btext('body', 'النص (افصل الفقرات بسطر فارغ)', 'Copy (blank line between paragraphs)', fmt='textarea'),
        btext('quote', 'اقتباس بارز', 'Pull quote'),
        btext('quote_author', 'صاحب الاقتباس', 'Quote author'),
        btext('link_text', 'نص الرابط', 'Link text'),
        burl('link_url', 'الرابط', 'Link'),
        bdrop('image_side', 'موضع الصورة', 'Image side', [('start', 'البداية', 'Start'), ('end', 'النهاية', 'End')], 'start'),
    ]),
    block(K['mj-lookbook'], 'mj-lookbook', 'مِجمر: كتالوج الصور', 'Majmar: Lookbook', 'sicon-image-carousel', [
        btext('overline', 'سطر تمهيدي', 'Overline'),
        btext('title', 'العنوان', 'Title'),
        coll('images', 'الصور', 'Images', [
            bimg('image', 'الصورة', 'Image'),
            btext('caption', 'التعليق (نص بديل)', 'Caption (also alt text)'),
        ], 0, 12, L('صورة', 'Image')),
    ]),
    block(K['mj-testimonials'], 'mj-testimonials', 'مِجمر: آراء العملاء', 'Majmar: Testimonials', 'sicon-chat-conversation-alt', [
        btext('overline', 'سطر تمهيدي', 'Overline'),
        btext('title', 'العنوان', 'Title'),
        coll('items', 'الآراء', 'Testimonials', [
            btext('name', 'الاسم', 'Name'),
            btext('location', 'المدينة', 'City'),
            btext('quote', 'الرأي', 'Quote', fmt='textarea'),
            bf('rating', 'number', 'التقييم (1-5)', 'Rating (1-5)', format='integer', value=5),
        ], 0, 9, L('رأي', 'Testimonial')),
    ]),
    block(K['mj-social'], 'mj-social', 'مِجمر: شبكة التواصل', 'Majmar: Social Grid', 'sicon-instagram', [
        btext('overline', 'سطر تمهيدي', 'Overline'),
        btext('title', 'العنوان', 'Title'),
        btext('handle', 'اسم الحساب', 'Handle', ml=False),
        burl('profile_url', 'رابط الحساب (افتراضياً إنستغرام من الإعدادات)', 'Profile link (defaults to Instagram in settings)'),
        coll('posts', 'المنشورات', 'Posts', [
            bimg('image', 'الصورة', 'Image', '1080×1080 px.'),
            burl('url', 'رابط المنشور', 'Post link'),
        ], 0, 8, L('منشور', 'Post')),
    ]),
    block(K['mj-newsletter'], 'mj-newsletter', 'مِجمر: النشرة البريدية', 'Majmar: Newsletter', 'sicon-mail', [
        btext('overline', 'سطر تمهيدي', 'Overline'),
        btext('title', 'العنوان', 'Title'),
        btext('text', 'الوصف', 'Text', fmt='textarea'),
        btext('button', 'نص الزر', 'Button text'),
        burl('form_action', 'رابط نموذج الاشتراك (Mailchimp أو Klaviyo)', 'Signup form action URL (Mailchimp, Klaviyo)'),
    ]),
    block(K['mj-trust'], 'mj-trust', 'مِجمر: شريط الثقة', 'Majmar: Trust Bar', 'sicon-award-ribbon', [
        coll('items', 'الوعود', 'Promises', [
            bdrop('icon', 'الأيقونة', 'Icon', [('delivery', 'توصيل', 'Delivery'), ('returns', 'إرجاع', 'Returns'), ('secure', 'دفع آمن', 'Secure payment'), ('gift', 'تغليف هدية', 'Gift wrap')], 'delivery'),
            btext('title', 'العنوان', 'Title'),
            btext('text', 'الوصف', 'Text'),
        ], 0, 4, L('وعد', 'Promise')),
        bf('show_payments', 'boolean', 'إظهار وسائل الدفع', 'Show payment methods', format='switch', value=True, selected=True),
        bf('payments', 'items', 'وسائل الدفع', 'Payment methods', format='dropdown-list', multichoice=True,
           options=[{'label': n, 'value': v} for v, n in [('mada', 'mada'), ('applepay', 'Apple Pay'), ('stcpay', 'STC Pay'), ('tabby', 'tabby'), ('tamara', 'tamara'), ('visa', 'VISA'), ('mastercard', 'Mastercard')]],
           selected=[], value=['mada', 'applepay', 'stcpay', 'tabby', 'tamara']),
    ]),
]

import os
CONV = 'scripts/blocks-conversion.json'
if os.path.exists(CONV):
    with io.open(CONV, encoding='utf8') as fh:
        conv = json.load(fh)
    for b in conv.get('blocks', []):
        COMPONENTS.append({
            'key': b['key'],
            'title': {'ar': b['title']['ar'].replace('مجمر:', 'مِجمر:'), 'en': b['title']['en']},
            'icon': b.get('icon', 'sicon-store'),
            'path': b['path'],
            'fields': b['fields'],
        })

with io.open(PATH, encoding='utf8') as fh:
    manifest = json.load(fh)

manifest['name'] = {'ar': 'مِجمر', 'en': 'Majmar'}
manifest['description'] = {
    'ar': 'قالب سينمائي فاخر لمتاجر العطور ودهن العود والبخور: قارورة ثلاثية الأبعاد، فيلم منتج يتحرك مع التمرير، وأدوات بيع مصممة للهدايا والمواسم.',
    'en': 'A cinematic luxury theme for perfume, oud and bakhoor stores: a 3D bottle, a scroll-driven product film and selling tools built for gifting and occasions.',
}
manifest['settings'] = [s for s in manifest['settings'] if not s['id'].startswith('mj')] + SETTINGS
manifest['components'] = [c for c in manifest['components'] if not c['path'].startswith('home.mj-')]
# Majmar blocks first so a new store's block picker leads with them.
manifest['components'] = COMPONENTS + manifest['components']

with io.open(PATH, 'w', encoding='utf8') as fh:
    json.dump(manifest, fh, ensure_ascii=False, indent=2)
    fh.write('\n')

print(f"settings: {len(manifest['settings'])}, components: {len(manifest['components'])}")
