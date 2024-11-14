import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Loading = () => {
    return (_jsxs("div", { className: 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm', children: [_jsxs("svg", { className: 'animate-spin h-12 w-12 text-primary mb-4', xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', children: [_jsx("circle", { className: 'opacity-25', cx: '12', cy: '12', r: '10', stroke: 'currentColor', strokeWidth: '4' }), _jsx("path", { className: 'opacity-75', fill: 'currentColor', d: 'M4 12a8 8 0 018-8v8H4z' })] }), _jsxs("p", { className: 'text-white text-xl', children: ["Calculando las", ' ', _jsx("span", { className: 'text-primary font-bold', children: "comunidades" }), " de artistas..."] })] }));
};
export default Loading;
