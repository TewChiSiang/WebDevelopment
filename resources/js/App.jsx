import { createInertiaApp } from '@inertiajs/inertia-react';
import { createRoot } from 'react-dom/client';  // 使用 createRoot 替代 render
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import '../css/app.css'; // Import the Tailwind CSS file


createInertiaApp({
    resolve: (name) => {
        const path = `./Pages/${name}.jsx`;
        console.log(`Resolving path: ${path}`);
        return resolvePageComponent(
            path,
            import.meta.glob('./Pages/**/*.jsx')
        );    
  },
  setup({ el, App, props }) {
    const root = createRoot(el);  // 使用 createRoot 创建根节点
    root.render(<App {...props} />);  // 渲染组件
  },
});
