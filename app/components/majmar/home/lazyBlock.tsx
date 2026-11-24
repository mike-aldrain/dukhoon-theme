import { lazy, Suspense, type ComponentType } from 'react';

/**
 * Wraps a home block so its code is split into its own file and only downloaded on pages
 * that use it. The server still renders the block in full (React streams the Suspense
 * boundary), so shoppers and search engines see the same HTML as before.
 */
export function lazyBlock<P extends object>(load: () => Promise<ComponentType<P>>): ComponentType<P> {
  const Lazy = lazy(() => load().then((C) => ({ default: C })));
  function LazyBlock(props: P) {
    return (
      <Suspense fallback={null}>
        <Lazy {...props} />
      </Suspense>
    );
  }
  return LazyBlock;
}
