const News = require('../models/News');
const { sanitizarHtml } = require('../utils/sanitizarHtml');

const noEncontrada = (res, error) =>
    error?.name === 'CastError' ? res.status(404).json({ msg: 'Noticia no encontrada' }) : null;

exports.crearNoticia = async (req, res) => {
    const { titulo, descripcion, contenido } = req.body;

    try {
        const nuevaNoticia = new News({
            titulo,
            descripcion,
            contenido: sanitizarHtml(contenido),
            autor: req.admin.id
        });

        const noticiaGuardada = await nuevaNoticia.save();
        await noticiaGuardada.populate('autor', 'nombre');
        res.status(201).json(noticiaGuardada);
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear la noticia', error: error.message });
    }
};

exports.obtenerNoticias = async (req, res) => {
    try {
        const noticias = await News.find().populate('autor', 'nombre').sort({ createdAt: -1 });
        res.json(noticias);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener las noticias', error: error.message });
    }
};

exports.obtenerNoticiaPorId = async (req, res) => {
    try {
        const noticia = await News.findById(req.params.id).populate('autor', 'nombre');
        if (!noticia) return res.status(404).json({ msg: 'Noticia no encontrada' });

        res.json(noticia);
    } catch (error) {
        if (noEncontrada(res, error)) return;
        res.status(500).json({ msg: 'Error al obtener la noticia', error: error.message });
    }
};

exports.actualizarNoticia = async (req, res) => {
    try {
        const { titulo, descripcion, contenido } = req.body;

        const cambios = {};
        if (titulo !== undefined) cambios.titulo = titulo;
        if (descripcion !== undefined) cambios.descripcion = descripcion;
        if (contenido !== undefined) cambios.contenido = sanitizarHtml(contenido);

        const noticiaActualizada = await News.findByIdAndUpdate(
            req.params.id,
            cambios,
            { returnDocument: 'after', runValidators: true }
        ).populate('autor', 'nombre');

        if (!noticiaActualizada) return res.status(404).json({ msg: 'Noticia no encontrada' });
        res.json(noticiaActualizada);
    } catch (error) {
        if (noEncontrada(res, error)) return;
        res.status(500).json({ msg: 'Error al actualizar la noticia', error: error.message });
    }
};

exports.eliminarNoticia = async (req, res) => {
    try {
        const noticiaEliminada = await News.findByIdAndDelete(req.params.id);
        if (!noticiaEliminada) return res.status(404).json({ msg: 'Noticia no encontrada' });

        res.json({ msg: 'Noticia eliminada correctamente' });
    } catch (error) {
        if (noEncontrada(res, error)) return;
        res.status(500).json({ msg: 'Error al eliminar la noticia', error: error.message });
    }
};

exports.darLike = async (req, res) => {
    try {
        const noticia = await News.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { returnDocument: 'after' }
        );
        if (!noticia) return res.status(404).json({ msg: 'Noticia no encontrada' });

        res.json({ msg: 'Like registrado', likes: noticia.likes });
    } catch (error) {
        if (noEncontrada(res, error)) return;
        res.status(500).json({ msg: 'Error al dar like', error: error.message });
    }
};
