import React, { createContext, useContext, useState, useCallback } from "react";
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../firebase";

const BlogContext = createContext();

export const useBlog = () => {
    const context = useContext(BlogContext);
    if (!context) {
        throw new Error("useBlog must be used within a BlogProvider");
    }
    return context;
};

export const BlogProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [currentPost, setCurrentPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);

    const POSTS_PER_PAGE = 6;

    const fetchPosts = useCallback(async (category = null, reset = true) => {
        setLoading(true);
        setError(null);

        try {
            let q;
            const postsRef = collection(db, "blog_posts");

            if (category) {
                q = query(
                    postsRef,
                    where("status", "==", "published"),
                    where("category.en", "==", category),
                    orderBy("publishedAt", "desc"),
                    limit(POSTS_PER_PAGE)
                );
            } else {
                q = query(
                    postsRef,
                    where("status", "==", "published"),
                    orderBy("publishedAt", "desc"),
                    limit(POSTS_PER_PAGE)
                );
            }

            if (!reset && lastDoc) {
                q = query(
                    postsRef,
                    where("status", "==", "published"),
                    orderBy("publishedAt", "desc"),
                    startAfter(lastDoc),
                    limit(POSTS_PER_PAGE)
                );
            }

            const snapshot = await getDocs(q);
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (reset) {
                setPosts(fetchedPosts);
            } else {
                setPosts(prev => [...prev, ...fetchedPosts]);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [lastDoc]);

    const fetchPostBySlug = useCallback(async (slug) => {
        setLoading(true);
        setError(null);
        setCurrentPost(null);

        try {
            const postsRef = collection(db, "blog_posts");
            const q = query(
                postsRef,
                where("slug", "==", slug),
                where("status", "==", "published"),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const postData = {
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data()
                };
                setCurrentPost(postData);
                return postData;
            } else {
                setError("Post not found");
                return null;
            }
        } catch (err) {
            console.error("Error fetching post:", err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRelatedPosts = useCallback(async (category, currentPostId, limitCount = 3) => {
        try {
            const postsRef = collection(db, "blog_posts");
            const q = query(
                postsRef,
                where("status", "==", "published"),
                where("category.en", "==", category),
                orderBy("publishedAt", "desc"),
                limit(limitCount + 1)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(post => post.id !== currentPostId)
                .slice(0, limitCount);
        } catch (err) {
            console.error("Error fetching related posts:", err);
            return [];
        }
    }, []);

    const getCategories = useCallback(() => {
        return [
            { en: "Learning Tips", ar: "نصائح التعلم" },
            { en: "English Grammar", ar: "قواعد اللغة الإنجليزية" },
            { en: "Vocabulary", ar: "المفردات" },
            { en: "Study Guides", ar: "أدلة الدراسة" },
            { en: "Success Stories", ar: "قصص النجاح" },
            { en: "Platform Updates", ar: "تحديثات المنصة" }
        ];
    }, []);

    const loadMore = useCallback(() => {
        if (hasMore && !loading) {
            fetchPosts(null, false);
        }
    }, [hasMore, loading, fetchPosts]);

    const value = {
        posts,
        currentPost,
        loading,
        error,
        hasMore,
        fetchPosts,
        fetchPostBySlug,
        fetchRelatedPosts,
        getCategories,
        loadMore
    };

    return (
        <BlogContext.Provider value={value}>
            {children}
        </BlogContext.Provider>
    );
};

export default BlogContext;
