const h = (tag, props, ...children) => {
    const element = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
        if (key.startsWith('on')) {
            const event = key.slice(2).toLowerCase();
            element.addEventListener(event, value);
        } else {
            element.setAttribute(key, value);
        }
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        } else if (Array.isArray(child)) {
            child.forEach(c => {
                if (c instanceof Node) {
                    element.appendChild(c);
                }
            });
        }
    });
    return element;
};
