"""
Merges the Majmar strings (`mj.*` keys) into locales/ar.json and locales/en.json.
Run from the theme root:  python scripts/locales-mj.py
Keys are flat, as the engine expects. Arabic is written as Arabic copy, not a literal
translation of the English.
"""
import io
import json

NA = {
    # key: (ar, en)
    'mj.skip_to_content': ('تخطَّ إلى المحتوى', 'Skip to content'),
    'mj.close': ('إغلاق', 'Close'),
    'mj.prev': ('السابق', 'Previous'),
    'mj.next': ('التالي', 'Next'),
    'mj.view_all': ('عرض الكل', 'View all'),
    'mj.whatsapp': ('تحدث معنا عبر واتساب', 'Chat with us on WhatsApp'),
    'mj.announcement.label': ('إعلان', 'Announcement'),
    'mj.announcement.default': ('توصيل مجاني لجميع مناطق المملكة للطلبات فوق 500 ر.س', 'Complimentary delivery across the Kingdom on orders above 500 SAR'),
    'mj.cookie.label': ('تنبيه ملفات الارتباط', 'Cookie notice'),
    'mj.cookie.text': ('نستخدم ملفات ارتباط أساسية لحفظ سلتك وتفضيلاتك. باستمرارك في التصفح فأنت توافق عليها.', 'We use essential cookies to keep your bag and preferences. By continuing you accept them.'),
    'mj.cookie.accept': ('موافق', 'Accept'),
    # Mini cart
    'mj.cart.open': ('فتح الحقيبة', 'Open bag'),
    'mj.cart.title': ('حقيبتك', 'Your bag'),
    'mj.cart.empty': ('حقيبتك بانتظار أول قطعة.', 'Your bag is waiting to be filled.'),
    'mj.cart.continue': ('متابعة التصفح', 'Continue browsing'),
    'mj.cart.quantity': ('الكمية', 'Quantity'),
    'mj.cart.decrease': ('إنقاص الكمية', 'Decrease quantity'),
    'mj.cart.increase': ('زيادة الكمية', 'Increase quantity'),
    'mj.cart.remove': ('إزالة {{name}}', 'Remove {{name}}'),
    'mj.cart.subtotal': ('المجموع', 'Subtotal'),
    'mj.cart.taxes_note': ('تُحتسب رسوم التوصيل والضريبة عند إتمام الطلب.', 'Delivery and taxes are confirmed at checkout.'),
    'mj.cart.checkout': ('مراجعة الحقيبة وإتمام الطلب', 'Review bag and checkout'),
    'mj.cart.free_ship_left': ('المتبقي للتوصيل المجاني:', 'Remaining for complimentary delivery:'),
    # Hero
    'mj.hero.overline': ('دار القطع النادرة', 'Maison of rare objects'),
    'mj.hero.title': ('صُنعت في ضوءٍ هادئ', 'Crafted in quiet light'),
    'mj.hero.subtitle': ('عطور ومجوهرات وقطع منزلية تُصنع بتأنٍّ وباليد، لمن يلاحظ التفاصيل.', 'Fragrance, jewellery and objects made slowly, by hand, for those who notice.'),
    'mj.hero.cta_primary': ('اكتشف المجموعة', 'Discover the collection'),
    'mj.hero.cta_secondary': ('قصتنا', 'Our story'),
    # Collections
    'mj.collections.overline': ('المجموعات', 'The collections'),
    'mj.collections.title': ('مختارات الموسم', 'Chosen for the season'),
    'mj.collections.demo1_title': ('عود وعنبر', 'Oud & Amber'),
    'mj.collections.demo1_caption': ('عطور المساء', 'Evening fragrances'),
    'mj.collections.demo2_title': ('مجوهرات راقية', 'Fine Jewellery'),
    'mj.collections.demo2_caption': ('ذهب ولؤلؤ وأحجار', 'Gold, pearl, stone'),
    'mj.collections.demo3_title': ('لمسات المنزل', 'The Home Edit'),
    'mj.collections.demo3_caption': ('قطع لغرف هادئة', 'Objects for slow rooms'),
    # Showcase
    'mj.showcase.overline': ('وصل حديثاً', 'New in'),
    'mj.showcase.title': ('مختارات الأتيليه', 'The atelier selection'),
    # Story
    'mj.story.overline': ('ورشتنا', 'Our atelier'),
    'mj.story.title': ('تُصنع بتأنٍّ وتبقى مدى العمر', 'Made slowly, kept for life'),
    'mj.story.body': ('تبدأ كل قطعة في ورشة صغيرة يُقاس فيها الوقت بالطبقات لا بالساعات. نختار خامات نادرة، ونشكّلها باليد، ونُنهيها تحت ضوء ناعم، لتصلك القطعة وهي تحمل الصبر الذي صُنعت به.', 'Every piece begins in a small studio where time is measured in layers, not hours. We source rare materials, work them by hand and finish each object under soft light, so that what reaches you carries the patience it was made with.'),
    'mj.story.quote': ('الفخامة عناية تشعر بها قبل أن تجد لها اسماً.', 'Luxury is the care you can feel before you can name it.'),
    'mj.story.quote_author': ('المؤسِّسة', 'The founder'),
    'mj.story.link': ('اقرأ قصتنا', 'Read our story'),
    # Lookbook
    'mj.lookbook.overline': ('كتالوج الصور', 'Lookbook'),
    'mj.lookbook.title': ('دراسات في الضوء', 'Studies in light'),
    'mj.lookbook.image': ('الإطلالة {{n}}', 'Look {{n}}'),
    'mj.lookbook.open': ('فتح الصورة: {{caption}}', 'Open image: {{caption}}'),
    # Testimonials
    'mj.testimonials.overline': ('كلمات لطيفة', 'Kind words'),
    'mj.testimonials.title': ('من عملائنا', 'From our clients'),
    'mj.testimonials.rating': ('التقييم {{n}} من 5', 'Rated {{n}} out of 5'),
    'mj.testimonials.demo1_name': ('نورة ع.', 'Noura A.'),
    'mj.testimonials.demo1_city': ('الرياض', 'Riyadh'),
    'mj.testimonials.demo1_quote': ('وصلت القارورة مغلّفة كهدية لنفسي، والرائحة تدوم من الصباح حتى العشاء.', 'The bottle arrived wrapped like a gift to myself. The scent lasts from morning prayer to dinner.'),
    'mj.testimonials.demo2_name': ('فيصل ك.', 'Faisal K.'),
    'mj.testimonials.demo2_city': ('جدة', 'Jeddah'),
    'mj.testimonials.demo2_quote': ('خدمة هادئة ودقيقة، والنقش على الأزرار جاء تماماً كما طلبت.', 'Quiet, precise service. The engraving on the cufflinks was exactly as I asked.'),
    'mj.testimonials.demo3_name': ('ليلى م.', 'Layla M.'),
    'mj.testimonials.demo3_city': ('دبي', 'Dubai'),
    'mj.testimonials.demo3_quote': ('كل قطعة في مجلسنا اليوم من هنا، والضيوف يسألون دائماً.', 'Every object in our majlis now comes from here. Guests always ask.'),
    # Social
    'mj.social.overline': ('تابع الأتيليه', 'Follow the atelier'),
    'mj.social.title': ('خلف الزجاج', 'Behind the glass'),
    'mj.social.handle': ('@noiratelier', '@noiratelier'),
    # Newsletter
    'mj.newsletter.overline': ('القائمة الخاصة', 'The private list'),
    'mj.newsletter.title': ('أول من يرى القطع الجديدة', 'First light on new pieces'),
    'mj.newsletter.text': ('وصول مبكر للإصدارات المحدودة والعروض الخاصة، بما لا يزيد على رسالتين في الشهر.', 'Early access to limited editions and private previews. No more than twice a month.'),
    'mj.newsletter.label': ('البريد الإلكتروني', 'Email address'),
    'mj.newsletter.placeholder': ('بريدك الإلكتروني', 'Your email address'),
    'mj.newsletter.button': ('اشترك', 'Join'),
    'mj.newsletter.thanks': ('شكراً لك، تمت إضافتك إلى القائمة.', 'Thank you. You are on the list.'),
    # Trust
    'mj.trust.label': ('وعدنا', 'Our promise'),
    'mj.trust.payments': ('وسائل الدفع', 'Payment methods'),
    'mj.trust.delivery': ('توصيل لدول الخليج', 'Delivery across the GCC'),
    'mj.trust.delivery_text': ('مؤمَّن ومتتبَّع ومغلّف كهدية', 'Insured, tracked, gift-wrapped'),
    'mj.trust.returns': ('إرجاع خلال 14 يوماً', '14-day returns'),
    'mj.trust.returns_text': ('بسهولة ولباقة', 'Simple and courteous'),
    'mj.trust.secure': ('دفع آمن', 'Secure payment'),
    'mj.trust.secure_text': ('ادفع الآن أو على أقساط', 'Pay now or in instalments'),
    'mj.trust.gift': ('تغليف خاص', 'Signature wrapping'),
    'mj.trust.gift_text': ('مع بطاقة مكتوبة باليد', 'With a handwritten card'),
}

# --- Majmar copy (generated) ---
NA.update({'mj.announcement.default': ('توصيل مجاني لجميع مناطق المملكة للطلبات فوق 300 ر.س · تغليف هدايا مجاني', 'Free delivery across the Kingdom over 300 SAR · complimentary gift wrap'), 'mj.hero.overline': ('دار العود والعنبر', 'House of oud and amber'), 'mj.hero.title': ('عطرٌ يبقى بعدك', 'A scent that stays'), 'mj.hero.subtitle': ('دهن عود وعطور وبخور تُمزج باليد، لتبقى حاضرة بعد أن تغادر.', 'Oud oils, perfumes and bakhoor blended by hand, made to linger long after you leave.'), 'mj.hero.cta_primary': ('اكتشف العطور', 'Discover the scents'), 'mj.hero.cta_secondary': ('اعثر على عطرك', 'Find your scent'), 'mj.collections.overline': ('المجموعات', 'The collections'), 'mj.collections.title': ('لكل لحظة عطرها', 'A scent for every moment'), 'mj.collections.demo1_title': ('دهن العود', 'Oud oils'), 'mj.collections.demo1_caption': ('معتّق وثمين', 'Aged and rare'), 'mj.collections.demo2_title': ('البخور والمباخر', 'Bakhoor and burners'), 'mj.collections.demo2_caption': ('لمجلس يعبق بالترحيب', 'For a welcoming majlis'), 'mj.collections.demo3_title': ('أطقم الهدايا', 'Gift sets'), 'mj.collections.demo3_caption': ('جاهزة للإهداء', 'Ready to give'), 'mj.showcase.overline': ('الأكثر مبيعاً', 'Best sellers'), 'mj.showcase.title': ('عطور يعود إليها عملاؤنا', 'Scents our clients come back to'), 'mj.story.overline': ('حكايتنا', 'Our story'), 'mj.story.title': ('من خشب العود إلى قارورتك', 'From oud wood to your bottle'), 'mj.story.body': ('نختار خشب العود من مصادره، ونقطّره ببطء، ونتركه يعتّق حتى ينضج. ثم نمزجه باليد مع الورد والعنبر والمسك، لنصنع عطوراً تحمل دفء المجلس وكرم الضيافة.', 'We source oud wood at origin, distil it slowly and let it age until it is ready. Then we blend it by hand with rose, amber and musk, to make scents that carry the warmth of the majlis.'), 'mj.story.quote': ('العطر أول ما يصل، وآخر ما يُنسى.', 'Scent is the first to arrive and the last to be forgotten.'), 'mj.story.quote_author': ('صانع العطور', 'The perfumer'), 'mj.story.link': ('اقرأ حكايتنا', 'Read our story'), 'mj.lookbook.overline': ('معرض الصور', 'Gallery'), 'mj.lookbook.title': ('طقوس العطر', 'Rituals of scent'), 'mj.social.overline': ('تابعنا', 'Follow us'), 'mj.social.title': ('من مجلسنا إليكم', 'From our majlis to you'), 'mj.social.handle': ('@majmar', '@majmar'), 'mj.newsletter.overline': ('القائمة الخاصة', 'The private list'), 'mj.newsletter.title': ('أول من يجرّب الإصدارات الجديدة', 'First to try new releases'), 'mj.testimonials.demo1_quote': ('العطر ثابت من الصباح إلى المساء، والتغليف يليق بهدية.', 'The scent lasts from morning to evening, and the wrapping is gift-worthy.'), 'mj.testimonials.demo2_quote': ('دهن العود أصلي وفخم، والطلب وصل في يومين.', 'The oud oil is genuine and rich; the order arrived in two days.'), 'mj.testimonials.demo3_quote': ('البخور صار عادة في مجلسنا، والضيوف يسألون عنه دائماً.', 'The bakhoor is now a ritual in our majlis; guests always ask about it.'), 'mj.film.overline': ('الفيلم', 'The film'), 'mj.film.title': ('داخل القارورة', 'Inside the flacon'), 'mj.film.hint': ('مرّر للمشاهدة', 'Scroll to play'), 'mj.film.ch1_title': ('زجاج منفوخ', 'Blown glass'), 'mj.film.ch1_text': ('كل قارورة تُنفخ وتُصقل يدوياً.', 'Each flacon is mouth-blown and polished by hand.'), 'mj.film.ch2_title': ('القمة: زعفران وبرغموت', 'Top: saffron and bergamot'), 'mj.film.ch2_text': ('افتتاحية دافئة ومشرقة تستقبلك أولاً.', 'A bright, warm opening that greets you first.'), 'mj.film.ch3_title': ('القلب: ورد الطائف', 'Heart: Taif rose'), 'mj.film.ch3_text': ('ورد من مرتفعات الطائف يُقطف عند الفجر.', 'Rose from the Taif highlands, picked at dawn.'), 'mj.film.ch4_title': ('القاعدة: عود معتّق', 'Base: aged oud'), 'mj.film.ch4_text': ('اثنتا عشرة ساعة على البشرة، ويبقى العطر عطرك.', 'Twelve hours on skin, and the scent is still yours.'), 'mj.film.buy_overline': ('متوفر الآن', 'Now available'), 'mj.film.add': ('أضف إلى الحقيبة', 'Add to bag'), 'mj.film.details': ('التفاصيل', 'View details'), 'mj.notes.title': ('هوية العطر', 'Scent profile'), 'mj.notes.top': ('القمة', 'Top notes'), 'mj.notes.top_hint': ('الانطباع الأول', 'The first impression'), 'mj.notes.heart': ('القلب', 'Heart notes'), 'mj.notes.heart_hint': ('بعد دقائق', 'After a few minutes'), 'mj.notes.base': ('القاعدة', 'Base notes'), 'mj.notes.base_hint': ('ما يبقى لساعات', 'What stays for hours'), 'mj.notes.longevity': ('الثبات', 'Longevity'), 'mj.notes.longevity_low': ('خفيف', 'Light'), 'mj.notes.longevity_high': ('طوال اليوم', 'All day'), 'mj.notes.sillage': ('الفوحان', 'Sillage'), 'mj.notes.sillage_low': ('قريب من البشرة', 'Close to skin'), 'mj.notes.sillage_high': ('يملأ المكان', 'Fills the room')})

import os
CONV = 'scripts/blocks-conversion.json'
if os.path.exists(CONV):
    with io.open(CONV, encoding='utf8') as fh:
        for k, v in json.load(fh).get('locales', {}).items():
            NA[k] = (v[0], v[1])

# Oud-only house: every default line speaks about oud (Oct 2026 revision).
NA.update({
    'mj.hero.overline': ('دار العود · إصدار ٢٠٢٦', 'House of oud · 2026 edition'),
    'mj.hero.title': ('عودٌ يبقى بعدك', 'Oud that stays after you'),
    'mj.hero.highlight': ('يبقى', 'stays'),
    'mj.hero.subtitle': ('عود رويال: عود كمبودي معتّق مع لمسة زعفران. اثنتا عشرة ساعة على البشرة.', 'Oud Royal: aged Cambodian oud with a touch of saffron. Twelve hours on skin.'),
    'mj.hero.giant': ('عود', 'Oud'),
    'mj.hero.sticker': ('', ''),
    'mj.hero.sticker_badge': ('', ''),
    'mj.hero.cta_primary': ('تسوّق العود', 'Shop the oud'),
    'mj.hero.cta_secondary': ('شاهد الفيلم', 'Watch the film'),
    'mj.hero.drag': ('اسحب لتدوير القارورة', 'Drag to turn the bottle'),
    'mj.marquee.words': ('عود كمبودي, عود هندي, دهن العود, عود معطّر, مخلّط, بخور المجلس', 'Cambodian oud, Hindi oud, Oud oil, Muattar, Mukhallat, Majlis bakhoor'),
    'mj.showcase.overline': ('مجموعة العود', 'The oud collection'),
    'mj.showcase.title': ('عود يعود إليه عملاؤنا', 'Oud our clients come back to'),
    'mj.families.overline': ('عالم العود', 'The world of oud'),
    'mj.families.title': ('اختر عودك', 'Choose your oud'),
    'mj.families.cambodi': ('كمبودي', 'Cambodi'),
    'mj.families.hindi': ('هندي', 'Hindi'),
    'mj.families.oil': ('دهن العود', 'Oud oil'),
    'mj.families.muattar': ('عود معطّر', 'Muattar'),
    'mj.families.mukhallat': ('مخلّط', 'Mukhallat'),
    'mj.families.bakhoor': ('بخور', 'Bakhoor'),
    'mj.film.title': ('داخل القارورة', 'Inside the flacon'),
    'mj.film.ch1_title': ('زجاج منفوخ باليد', 'Blown by hand'),
    'mj.film.ch1_text': ('قارورة ثقيلة من الزجاج الصافي، تُصقل حوافها واحدة واحدة.', 'A heavy flacon of clear glass, its edges polished one by one.'),
    'mj.film.ch2_title': ('عود كمبودي', 'Cambodian oud'),
    'mj.film.ch2_text': ('خشب عود من غابات كمبوديا، يُقطّر ببطء على نار هادئة.', 'Oud wood from the forests of Cambodia, distilled slowly over a low fire.'),
    'mj.film.ch3_title': ('معتّق عشر سنوات', 'Aged ten years'),
    'mj.film.ch3_text': ('يرتاح الدهن في الظلام حتى ينضج ويصفو.', 'The oil rests in the dark until it rounds and clears.'),
    'mj.film.ch4_title': ('يبقى معك', 'It stays with you'),
    'mj.film.ch4_text': ('اثنتا عشرة ساعة على البشرة، ويبقى العود عودك.', 'Twelve hours on skin, and the oud is still yours.'),
    'mj.film.buy_overline': ('متوفر الآن', 'Available now'),
})

# Store layout blocks (Nov 2026).
NA.update({
    'mj.slider.label': ('العروض الرئيسية', 'Featured'),
    'mj.slider.s1_over': ('الإصدار الجديد ٢٠٢٦', 'New 2026 edition'),
    'mj.slider.s1_title': ('عود رويال: عودٌ يبقى بعدك', 'Oud Royal: oud that stays after you'),
    'mj.slider.s1_text': ('عود كمبودي معتّق مع لمسة زعفران، اثنتا عشرة ساعة على البشرة.', 'Aged Cambodian oud with a touch of saffron. Twelve hours on skin.'),
    'mj.slider.shop': ('تسوّق الآن', 'Shop now'),
    'mj.slider.s2_over': ('دهن العود', 'Oud oils'),
    'mj.slider.s2_title': ('دهون العود الأصلية', 'Genuine oud oils'),
    'mj.slider.s2_text': ('كمبودي وهندي ومخلّط، تولة واحدة تكفي لأشهر.', 'Cambodi, Hindi and mukhallat. One tola lasts for months.'),
    'mj.slider.s2_button': ('اكتشف الدهون', 'Discover the oils'),
    'mj.slider.go': ('الشريحة {{n}}', 'Slide {{n}}'),
    'mj.slider.offer': ('عروض سريعة', 'Flash offer'),
    'mj.slider.ends': ('ينتهي العرض بعد', 'Ends in'),
    'mj.cats.title': ('تسوّق حسب الفئة', 'Shop by category'),
    'mj.cats.all': ('كل الفئات', 'All categories'),
    'mj.cats.shop': ('تسوّق', 'Shop'),
    'mj.cats.perfume': ('عطور العود', 'Oud perfumes'),
    'mj.cats.oil': ('دهن العود', 'Oud oils'),
    'mj.cats.wood': ('خشب العود', 'Oud wood'),
    'mj.cats.bakhoor': ('البخور والمباخر', 'Bakhoor and burners'),
    'mj.cats.gifts': ('أطقم الهدايا', 'Gift sets'),
    'mj.promos.label': ('عروض مميزة', 'Offers'),
    'mj.promos.p1_over': ('الأقوى في الدار', 'The strongest in the house'),
    'mj.promos.p1_title': ('عود إنتنس', 'Oud Intense'),
    'mj.promos.p1_text': ('عود وعنبر ولبان بتركيز بارفان.', 'Oud, amber and frankincense at parfum strength.'),
    'mj.promos.p2_over': ('للمجلس', 'For the majlis'),
    'mj.promos.p2_title': ('البخور والمباخر', 'Bakhoor and burners'),
    'mj.promos.p2_text': ('بخور معطّر بالعود ومبخرة نحاسية مصقولة.', 'Oud-scented bakhoor and a polished brass burner.'),
    'mj.promos.p2_button': ('اكتشف المجموعة', 'Discover the collection'),
    'mj.wide.title': ('مجموعة العود الكمبودي', 'The Cambodian oud collection'),
    'mj.wide.text': ('أربعة عطور من عود واحد، لكل مناسبة عطرها.', 'Four perfumes from one oud, a scent for every occasion.'),
    'mj.wide.button': ('تسوّق المجموعة', 'Shop the collection'),
    'mj.showcase.title': ('الأكثر مبيعاً', 'Best sellers'),
    'mj.trust.delivery': ('شحن سريع', 'Fast shipping'),
    'mj.trust.delivery_text': ('٢ إلى ٤ أيام داخل المملكة', '2 to 4 days across the Kingdom'),
    'mj.trust.returns': ('عود أصلي مضمون', 'Genuine oud, guaranteed'),
    'mj.trust.returns_text': ('شهادة مصدر مع كل دهن', 'A certificate of origin with every oil'),
    'mj.trust.gift': ('تغليف هدايا فاخر', 'Luxury gift wrap'),
    'mj.trust.gift_text': ('مع بطاقة مكتوبة باليد', 'With a handwritten card'),
})

# Heritage modern (Nov 2026).
NA.update({
    'mj.slider.s1_over': ('إصدار الدرعية ٢٠٢٦', 'Diriyah edition 2026'),
    'mj.slider.s1_title': ('عودٌ يبقى بعدك', 'Oud that stays after you'),
    'mj.slider.s1_text': ('عود رويال: عود كمبودي معتّق عشر سنوات مع لمسة زعفران، اثنتا عشرة ساعة على البشرة.', 'Oud Royal: Cambodian oud aged ten years with a touch of saffron. Twelve hours on skin.'),
    'mj.slider.shop': ('تسوّق العود', 'Shop the oud'),
    'mj.slider.s2_over': ('للمجلس', 'For the majlis'),
    'mj.slider.s2_title': ('ضيافة تُشمّ قبل أن تُرى', 'Hospitality you can smell'),
    'mj.slider.s2_text': ('بخور ومباخر ودهون عود لمجلس يعبق بالترحيب.', 'Bakhoor, burners and oud oils for a welcoming majlis.'),
    'mj.slider.s2_button': ('اكتشف المجموعة', 'Discover the collection'),
    'mj.cats.overline': ('تسوّق حسب الفئة', 'Shop by category'),
    'mj.cats.stories_title': ('عالم العود', 'The world of oud'),
    'mj.cats.mukhallat': ('المخلّط', 'Mukhallat'),
    'mj.spin.overline': ('القارورة من كل الزوايا', 'The flacon from every angle'),
    'mj.spin.title': ('عود رويال', 'Oud Royal'),
    'mj.spin.text': ('قارورة من الزجاج الثقيل بغطاء مذهّب، تحمل عوداً كمبودياً معتّقاً يتطوّر على البشرة ساعة بعد ساعة.', 'A heavy glass flacon with a gilded cap, holding aged Cambodian oud that unfolds on skin hour after hour.'),
    'mj.occ.overline': ('لكل مناسبة عودها', 'An oud for every occasion'),
    'mj.occ.title': ('هدايا المناسبات', 'Occasion gifts'),
    'mj.occ.ramadan': ('رمضان', 'Ramadan'),
    'mj.occ.ramadan_text': ('هدايا الضيافة والسحور', 'Hospitality gifts for suhoor and iftar'),
    'mj.occ.eid': ('العيد', 'Eid'),
    'mj.occ.eid_text': ('عيدية تليق بأحبابك', 'An eidiya worthy of your loved ones'),
    'mj.occ.founding': ('يوم التأسيس', 'Founding Day'),
    'mj.occ.founding_text': ('مجموعة الدرعية', 'The Diriyah collection'),
    'mj.occ.wedding': ('الأعراس', 'Weddings'),
    'mj.occ.wedding_text': ('أطقم العروس والعريس', 'Sets for the bride and groom'),
    'mj.occ.shop': ('تسوّق', 'Shop'),
    'mj.showcase.overline': ('الأكثر طلباً هذا الشهر', 'Most wanted this month'),
    'mj.showcase.title': ('مختارات الدار', 'The house selection'),
    'mj.wide.title': ('هدية الضيافة', 'The hospitality gift'),
    'mj.wide.text': ('صندوق فاخر من أربعة عطور، مع تغليف ذهبي وبطاقة إهداء بخط اليد.', 'A box of four perfumes, gold-wrapped, with a handwritten card.'),
    'mj.wide.button': ('صمّم هديتك', 'Build your gift'),
    'mj.announcement.default': ('شحن مجاني لجميع مناطق المملكة فوق ٣٠٠ ر.س · عود أصلي ١٠٠٪ · قسّطها مع تابي وتمارا', 'Free delivery across the Kingdom over 300 SAR · 100% genuine oud · Pay in 4 with Tabby or Tamara'),
})

# Noir (Nov 2026).
NA.update({
    'mj.noir.overline': ('إصدار الدرعية ٢٠٢٦', 'Diriyah edition 2026'),
    'mj.noir.title': ('عودٌ يبقى بعدك', 'Oud that stays after you'),
    'mj.noir.highlight': ('يبقى', 'stays'),
    'mj.noir.text': ('ليس كل عطرٍ يريد أن يُعجبك؛ بعضها يريد أن يبقى في ذاكرتك. عود كمبودي معتّق عشر سنوات.', 'Not every scent wants to please you; some want to stay in your memory. Cambodian oud aged ten years.'),
    'mj.noir.cta': ('تسوّق المجموعة', 'Shop the collection'),
    'mj.noir.cta2': ('اكتشف الإطلالات', 'Discover the looks'),
    'mj.noir.signature': ('توقيع الليلة', 'Signature of the night'),
    'mj.noir.add': ('أضفه إلى مجموعتك', 'Add to your collection'),
    'mj.looks.overline': ('وصل حديثاً', 'Just arrived'),
    'mj.looks.title': ('إطلالات الموسم', 'Looks of the season'),
    'mj.looks.l1': ('إطلالة العيد', 'Eid look'),
    'mj.looks.l2': ('ليالي المجلس', 'Majlis nights'),
    'mj.looks.l3': ('توقيع المساء', 'Evening signature'),
    'mj.looks.hint': ('اضغط (+) لرؤية المنتج', 'Tap (+) to see the product'),
    'mj.looks.view': ('عرض المنتج', 'View product'),
    'mj.tl.overline': ('رحلتنا', 'Our journey'),
    'mj.tl.title': ('من سوق الزل إلى كل مجلس', 'From the souq to every majlis'),
    'mj.tl.y1': ('٢٠١٨', '2018'), 'mj.tl.y2': ('٢٠٢٠', '2020'), 'mj.tl.y3': ('٢٠٢٣', '2023'), 'mj.tl.y4': ('٢٠٢٦', '2026'),
    'mj.tl.t1': ('البداية', 'The beginning'), 'mj.tl.t2': ('دهن العود الخاص', 'Our own oud oil'), 'mj.tl.t3': ('عشرون ألف عميل', 'Twenty thousand clients'), 'mj.tl.t4': ('إصدار الدرعية', 'The Diriyah edition'),
    'mj.tl.d1': ('من دكان صغير في سوق الزل بالرياض، بدأنا نختار العود بأيدينا.', 'From a small shop in Riyadh, we began choosing oud by hand.'),
    'mj.tl.d2': ('أطلقنا أول دهن عود معتّق عشر سنوات تحت اسم مِجمر.', 'We launched our first oud oil aged ten years.'),
    'mj.tl.d3': ('وصلنا إلى كل مدن المملكة ودول الخليج.', 'We reached every city in the Kingdom and the Gulf.'),
    'mj.tl.d4': ('مجموعة مستوحاة من عمارة نجد وضيافة المجلس.', 'A collection inspired by Najdi architecture and majlis hospitality.'),
    'mj.cats.stories_title': ('عالم مِجمر', 'The world of Majmar'),
    'mj.cats.discover': ('اكتشف', 'Discover'),
    'mj.showcase.title': ('عطور تستحق أن تبدأ بها', 'Scents worth starting with'),
    'mj.showcase.overline': ('الأكثر طلباً', 'Most wanted'),
})

for lang, idx in (('ar', 0), ('en', 1)):
    path = f'locales/{lang}.json'
    with io.open(path, encoding='utf8') as fh:
        data = json.load(fh)
    data = {k: v for k, v in data.items() if not k.startswith('mj.')}
    data.update({k: v[idx] for k, v in NA.items()})
    with io.open(path, 'w', encoding='utf8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print(path, len(data))
