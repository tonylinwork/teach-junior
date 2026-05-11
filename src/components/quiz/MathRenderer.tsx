import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
    content: string;
    className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Process the content to find and render LaTeX
        // This is a basic implementation that looks for $...$ and $$...$$
        // For a more robust solution, we might want to use a regex that handles escaping

        const renderMath = () => {
            const container = containerRef.current;
            if (!container) return;

            // Clear previous content if needed, though dangerouslySetInnerHTML handles this
            // We use a temporary div to render the HTML content first
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;

            // Function to process a text node
            const processTextNode = (node: Node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent || '';
                    const parts = [];
                    let lastIndex = 0;

                    // Regex for $$...$$ (block) and $...$ (inline)
                    // We use [\s\S] to match all characters including newlines
                    const mathRegex = /\$\$([\s\S]*?)\$\$|\$([\s\S]*?)\$/g;
                    let match;

                    while ((match = mathRegex.exec(text)) !== null) {
                        // Add text before the match
                        if (match.index > lastIndex) {
                            parts.push(document.createTextNode(text.substring(lastIndex, match.index)));
                        }

                        const blockMath = match[1];
                        const inlineMath = match[2];
                        let math = (blockMath || inlineMath || '').trim();
                        const isBlock = blockMath !== undefined;

                        // For inline math that contains fractions or other complex structures, 
                        // forcing displaystyle makes them much easier to read
                        if (!isBlock && (math.includes('\\frac') || math.includes('\\sqrt') || math.includes('\\sum'))) {
                            math = '\\displaystyle ' + math;
                        }

                        const span = document.createElement('span');
                        if (isBlock) {
                            span.style.display = 'block';
                            span.style.margin = '1em 0';
                            span.style.textAlign = 'center';
                        }

                        try {
                            katex.render(math, span, {
                                displayMode: isBlock,
                                throwOnError: false,
                                trust: true
                            });
                            parts.push(span);
                        } catch (e) {
                            parts.push(document.createTextNode(match[0]));
                        }

                        lastIndex = mathRegex.lastIndex;
                    }

                    // Add remaining text
                    if (lastIndex < text.length) {
                        parts.push(document.createTextNode(text.substring(lastIndex)));
                    }

                    // Replace the text node with the new parts
                    if (parts.length > 1 || (parts.length === 1 && parts[0].nodeType !== Node.TEXT_NODE)) {
                        const fragment = document.createDocumentFragment();
                        parts.forEach(p => fragment.appendChild(p));
                        node.parentNode?.replaceChild(fragment, node);
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    // Don't process script or style tags
                    if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                        // Process children
                        const children = Array.from(node.childNodes);
                        children.forEach(processTextNode);
                    }
                }
            };

            // Start processing from the root of tempDiv
            Array.from(tempDiv.childNodes).forEach(processTextNode);

            // Sync the rendered content back to our container
            container.innerHTML = '';
            while (tempDiv.firstChild) {
                container.appendChild(tempDiv.firstChild);
            }
        };

        renderMath();
    }, [content]);

    return (
        <div
            ref={containerRef}
            className={className}
        />
    );
};
