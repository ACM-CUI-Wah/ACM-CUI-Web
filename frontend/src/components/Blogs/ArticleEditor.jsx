
import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./articleEditor.css";
import { useArticleStore } from "../../store/useArticleStore";
import { useNavigate } from "react-router-dom";

function ArticleEditor({ mode = "create", blogData = null, onSuccess }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const { uploadInlineImage, saveBlog, loading, error } = useArticleStore();
  const quillRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "edit" && blogData) {
      setTitle(blogData.title || "");
      setContent(blogData.content || "");
      setCoverPreview(blogData.images[0].image_url || null);
    }
  }, [mode, blogData]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };


  const handleImageInsert = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const imageUrl = await uploadInlineImage(file);
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        editor.insertEmbed(range.index, "image", imageUrl);

      } catch (err) {
        alert(" Image upload failed. Please try again.");
        set({
          error:
            err.response?.data?.message ||
            err.response?.data ||
            "Failed to save blog",
        });
        throw err;

      };
    };
  }
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: { image: handleImageInsert },
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!title.trim()) {
      alert("⚠️ Title is required!");
      return;
    }
    if (!coverImage && !coverPreview) {
      alert("⚠️ Please upload a cover image.");
      return;
    }
    if (!content.trim() || content === "<p><br></p>") {
      alert("⚠️ Content cannot be empty.");
      return;
    }

    try {
      await saveBlog({
        mode,
        blogData,
        title,
        content,
        coverImage,
      });

      alert(mode === "edit" ? " Blog updated successfully!" : " Blog created successfully!");

      if (mode === "create") {
        setTitle("");
        setContent("");
        setCoverImage(null);
        setCoverPreview(null);
      }
      navigate("/dashboard");

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save blog. Please try again.");
    }
  };

  return (
    <form className="article-editor-container p-5" onSubmit={handleSubmit}>

      <input
        type="text"
        className="article-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter article title"
        required
      />


      <label className="mt-3">Cover Image:</label>
      <input type="file" accept="image/*" onChange={handleCoverChange} />
      {coverPreview && (
        <div className="cover-preview mt-2">
          <img src={coverPreview} alt="cover preview" />
          <button type="button" onClick={removeCoverImage}>
            ✕
          </button>
        </div>
      )}


      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={setContent}
        modules={modules}
        formats={formats}
        placeholder="Write your blog content here..."
      />


      {error && <p style={{ color: "red" }}>{error}</p>}


      <button type="submit" className="btn-submit mt-3" disabled={loading}>
        {loading ? "Saving..." : mode === "edit" ? "Update" : "Publish"}
      </button>
    </form>
  );
}

export default ArticleEditor;
