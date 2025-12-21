'use client';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
    return (
        <Tippy
            content={<div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>}
            placement="top"
            touch={['hold', 500]}
            hideOnClick={false}
            theme="dark"
            arrow={true}
            duration={200}
        >
            <div style={{ display: 'inline-block' }}>{children}</div>
        </Tippy>
    );
}