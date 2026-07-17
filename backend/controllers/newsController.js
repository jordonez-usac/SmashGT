const News = require('../models/News');

// Crear una noticia
exports.crearNoticia = async (req, res) => {
    const { titulo, descripcion, contenido } = req.body;
    
    try {
        const nuevaNoticia = new News({
            titulo,
            descripcion,
            contenido,
            autor: req.admin.id 
        });

        const noticiaGuardada = await nuevaNoticia.save();
        res.status(201).json(noticiaGuardada);
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear la noticia', error });
    }
};

// obtener noticias
exports.obtenerNoticias = async (req, res) => {
    try {
        // Hacemos populate para traernos el nombre del autor de Admin
        const noticias = await News.find().populate('autor', 'nombre').sort({ createdAt: -1 });
        res.json(noticias);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener las noticias', error });
    }
};

// Actualizar una noticia
exports.actualizarNoticia = async (req, res) => {
    try {
        const noticiaActualizada = await News.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        
        if (!noticiaActualizada) return res.status(404).json({ msg: 'Noticia no encontrada' });
        res.json(noticiaActualizada);
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar la noticia', error });
    }
};

// Eliminar una noticia
exports.eliminarNoticia = async (req, res) => {
    try {
        const noticiaEliminada = await News.findByIdAndDelete(req.params.id);
        if (!noticiaEliminada) return res.status(404).json({ msg: 'Noticia no encontrada' });
        
        res.json({ msg: 'Noticia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar la noticia', error });
    }
};

// Dar Like a una noticia 
exports.darLike = async (req, res) => {
    try {
        const noticia = await News.findById(req.params.id);
        if (!noticia) return res.status(404).json({ msg: 'Noticia no encontrada' });

        noticia.likes += 1;
        await noticia.save();

        res.json({ msg: 'Like registrado', likes: noticia.likes });
    } catch (error) {
        res.status(500).json({ msg: 'Error al dar like', error });
    }
};