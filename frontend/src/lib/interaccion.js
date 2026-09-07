export const interaccionPersonaje = {
    onPointerMove(evento) {
        if (evento.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const caja = evento.currentTarget.getBoundingClientRect();
        evento.currentTarget.style.setProperty('--luz-x', `${evento.clientX - caja.left}px`);
        evento.currentTarget.style.setProperty('--luz-y', `${evento.clientY - caja.top}px`);
        evento.currentTarget.style.setProperty('--arte-x', `${((evento.clientX - caja.left) / caja.width - .5) * 18}px`);
        evento.currentTarget.style.setProperty('--arte-y', `${((evento.clientY - caja.top) / caja.height - .5) * 10}px`);
        evento.currentTarget.style.setProperty('--giro-x', `${((evento.clientX - caja.left) / caja.width - .5) * 8}deg`);
        evento.currentTarget.style.setProperty('--giro-y', `${((evento.clientY - caja.top) / caja.height - .5) * -8}deg`);
    },
    onPointerLeave(evento) {
        evento.currentTarget.style.removeProperty('--arte-x');
        evento.currentTarget.style.removeProperty('--arte-y');
        evento.currentTarget.style.removeProperty('--giro-x');
        evento.currentTarget.style.removeProperty('--giro-y');
    },
};
