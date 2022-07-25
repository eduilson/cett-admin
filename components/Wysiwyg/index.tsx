import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import GlobalContext from "@/utils/globalContext";
import { nanoid } from 'nanoid'

type Props = {
    value?: any,
    onChange?: Function
}

const Wysiwyg = (props: Props) => {

  const {
    onChange,
    value
  } = props

  const globalContext = React.useContext(GlobalContext)
  const user = globalContext.user.get
  const [editorId] = React.useState(nanoid())

  const handleEditorChange = (content: string) => {
    onChange && onChange(content)
  }

  if(!user?.jwt.access_token) return null

  return (
      <Editor
        apiKey="f4sxx2i2azi8wsv8eohah1bpmsxw9dcj9tcst7qzt35zns9w"
        id={editorId}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={value || ""}
        init={{
          //base: "/",
          //skin: false,
          height: 500,
          menubar: false,
          valid_children : '+body[style]',
          //content_css: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor codemirror',
            'searchreplace visualblocks fullscreen',
            'insertdatetime media table paste help wordcount image lists advlist imagetools'
          ],
          automatic_uploads: true,
          file_picker_types: 'image',
          image_title: true,
          image_description: false,
          images_upload_url: process.env.NEXT_PUBLIC_API_URL + `admin/uploads?&token=${user?.jwt?.access_token}`,
          convert_urls: false,
          paste_as_text: true,
          language: "pt_BR",
          paste_data_images: true,
          codemirror: {
            indentOnInit: true, // Whether or not to indent code on init.
            //fullscreen: true,   // Default setting is false
            path: '/codemirror/', // Path to CodeMirror distribution
            config: {           // CodeMirror config object
              mode: 'htmlmixed',
              lineNumbers: true,
              theme: "dracula",
              styleActiveLine: true,
              matchBrackets: true
            },
            width: 800,         // Default value is 800
            height: 600,        // Default value is 550
            saveCursorPosition: true,    // Insert caret marker
            jsFiles: [          // Additional JS files to load
              //'mode/clike/clike.js',
              //'mode/php/php.js',
            ],
            cssFiles: [
              'theme/neat.css',
              'theme/dracula.css'
            ]
          },
          paste_word_valid_elements: 'b,strong,i,em,h1,h2,p,br',
          toolbar_mode: "sliding",
          toolbar:
            'undo redo | formatselect | bold italic backcolor | image | fullscreen |\
            alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | code | help'
        }}
        onEditorChange={handleEditorChange}
      />
  );
}


export default Wysiwyg;
