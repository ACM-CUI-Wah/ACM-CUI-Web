import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import BlogPost from './BlogPost';
import './Blog.css';
import axiosInstance from '../../../axios';

// ✅ user-generated HTML => strip tags for safety (avoid XSS)
const htmlToText = (html = '') => {
  const div = document.createElement('div');
  div.innerHTML = html;

  const withBreaks = div.innerHTML
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*p\s*>/gi, '\n')
    .replace(/<\/\s*div\s*>/gi, '\n')
    .replace(/<\/\s*li\s*>/gi, '\n')
    .replace(/<\/\s*h[1-6]\s*>/gi, '\n');

  div.innerHTML = withBreaks;

  return (div.textContent || div.innerText || '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

//  make a fixed-length preview
const truncateText = (text = '', maxChars = 180) => {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars).trimEnd() + '…';
};

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogsAndStudents = async () => {
      try {
        setLoading(true);
        setError('');

        // 1) Fetch blogs
        const blogsRes = await axiosInstance.get('/blogs/');
        const blogsData = Array.isArray(blogsRes.data) ? blogsRes.data : [];

        // 2) Fetch public students (optional)
        let studentsData = [];
        try {
          const studentsRes = await axiosInstance.get('/students/public/');
          studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [studentsRes.data];
        } catch (err) {
          console.warn('Could not fetch public students:', err);
        }

        // 3) Map blogs into BlogPost props
        const mapped = blogsData.map((blog, idx) => {
          const authorProfile = studentsData.find((s) => s.user_id === blog?.created_by?.id);

          const rawDesc = blog.description ?? blog.content ?? '';
          const safeDesc = htmlToText(rawDesc);

          // ✅ only preview text so height stays more consistent
          const shortDesc = truncateText(safeDesc, 180);

          return {
            id: blog.id ?? idx,
            title: blog.title ?? 'Untitled',
            description: shortDesc, // ✅ preview only
            imageUrl: blog?.images?.length > 0 ? blog.images[0].image_url : null,
            imageAlt: blog.title ?? 'Blog image',
            reverseOrder: idx % 2 === 1,
            authorName: authorProfile?.full_name || blog.createdBy || 'Unknown',
            authorImg: authorProfile?.profile_pic || null,
            date: blog.createdAt
              ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })
              : null
          };
        });

        setBlogs(mapped);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogsAndStudents();
  }, []);

  return (
    <div className="bgstyle border">
      <Container className="blogs">
        <h1 className="blog-title text-center">Blogs</h1>

        {loading && <p className="text-center">Loading blogs...</p>}
        {error && (
          <p className="text-center" style={{ color: 'red' }}>
            {error}
          </p>
        )}
        {!loading && !error && blogs.length === 0 && <p className="text-center">No blogs found.</p>}

        {!loading &&
          !error &&
          blogs.map((blog) => (
            <div key={blog.id} className="container blog-container justify-content-center">
              <BlogPost
               id={blog.id} 
                title={blog.title}
                description={blog.description} // ✅ short preview
                imageUrl={blog.imageUrl}
                imageAlt={blog.imageAlt}
                reverseOrder={blog.reverseOrder}
                authorName={blog.authorName}
                authorImg={blog.authorImg}
                date={blog.date}
              />
            </div>
          ))}
      </Container>
    </div>
  );
};

export default Blog;
