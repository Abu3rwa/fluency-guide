import React, { createContext, useContext, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPosts as fetchPostsThunk,
    fetchPostBySlug as fetchPostBySlugThunk,
    fetchRelatedPosts as fetchRelatedPostsThunk,
    selectBlogPosts,
    selectCurrentPost,
    selectBlogLoading,
    selectBlogError,
    selectBlogHasMore,
    selectRelatedPosts
} from '../store/slices/blogSlice';

const BlogContext = createContext();

export const useBlog = () => {
    const context = useContext(BlogContext);
    if (!context) {
        throw new Error("useBlog must be used within a BlogProvider");
    }
    return context;
};

export const BlogProvider = ({ children }) => {
    const dispatch = useDispatch();

    const posts = useSelector(selectBlogPosts);
    const currentPost = useSelector(selectCurrentPost);
    const loading = useSelector(selectBlogLoading);
    const error = useSelector(selectBlogError);
    const hasMore = useSelector(selectBlogHasMore);

    // We can expose relatedPosts from store if needed, 
    // though original context didn't expose state, just the fetcher.
    const relatedPosts = useSelector(selectRelatedPosts);

    const fetchPosts = useCallback(async (category = null, reset = true) => {
        dispatch(fetchPostsThunk({ category, reset }));
    }, [dispatch]);

    const fetchPostBySlug = useCallback(async (slug) => {
        const resultAction = await dispatch(fetchPostBySlugThunk(slug));
        if (fetchPostBySlugThunk.fulfilled.match(resultAction)) {
            return resultAction.payload;
        } else {
            return null; // Original context returned null on error/not found
        }
    }, [dispatch]);

    const fetchRelatedPosts = useCallback(async (category, currentPostId, limitCount = 3) => {
        const resultAction = await dispatch(fetchRelatedPostsThunk({ category, currentPostId, limitCount }));
        if (fetchRelatedPostsThunk.fulfilled.match(resultAction)) {
            return resultAction.payload;
        } else {
            return []; // Original context returned empty array on error
        }
    }, [dispatch]);

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
            dispatch(fetchPostsThunk({ category: null, reset: false }));
        }
    }, [hasMore, loading, dispatch]);

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
        loadMore,
        relatedPosts // Bonus: now exposed in state
    };

    return (
        <BlogContext.Provider value={value}>
            {children}
        </BlogContext.Provider>
    );
};

export default BlogContext;
