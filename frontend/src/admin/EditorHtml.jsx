import { Editor } from '@tinymce/tinymce-react';

import 'tinymce/tinymce';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';

import 'tinymce/skins/ui/oxide-dark/skin.js';
import 'tinymce/skins/content/dark/content.js';

import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/wordcount';

const PLUGINS = [
    'advlist', 'autolink', 'charmap', 'code', 'codesample', 'fullscreen',
    'image', 'link', 'lists', 'media', 'preview', 'searchreplace', 'table', 'wordcount',
];

const TOOLBAR =
    'undo redo | blocks | bold italic underline strikethrough | ' +
    'alignleft aligncenter alignright | bullist numlist | link image media table | ' +
    'blockquote codesample removeformat | preview code fullscreen';

const subirImagen = async (blobInfo) => {
    const imagen = await createImageBitmap(blobInfo.blob());
    const escala = Math.min(1, 1280 / Math.max(imagen.width, imagen.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(imagen.width * escala);
    canvas.height = Math.round(imagen.height * escala);
    canvas.getContext('2d').drawImage(imagen, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', .82);
};

export default function EditorHtml({ value, onChange, altura = 460 }) {
    return (
        <Editor
            licenseKey="gpl"
            value={value}
            onEditorChange={onChange}
            init={{
                height: altura,
                menubar: false,
                plugins: PLUGINS,
                toolbar: TOOLBAR,
                skin: 'oxide-dark',
                content_css: 'dark',
                content_style:
                    'body { font-family: system-ui, sans-serif; font-size: 15px; line-height: 1.7; }',
                branding: false,
                promotion: false,
                invalid_elements: 'script,style,iframe[!src],form,input,button',
                paste_data_images: true,
                images_upload_handler: subirImagen,
                automatic_uploads: true,
                image_uploadtab: true,
                images_file_types: 'jpeg,jpg,png,webp,gif',
                image_caption: true,
                statusbar: true,
            }}
        />
    );
}
