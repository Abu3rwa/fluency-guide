import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';

// ============================================
// ASYNC THUNKS
// ============================================

const POSTS_PER_PAGE = 6;

export const fetchPosts = createAsyncThunk(
    'blog/fetchPosts',
    async ({ category, reset = true }, { rejectWithValue, getState }) => {
        try {
            const { lastDoc } = getState().blog;
            const { userProfile } = getState().auth;
            const canViewDrafts = userProfile?.role === 'instructor' || userProfile?.isAdmin === true;

            const postsRef = collection(db, "blog_posts");
            let constraints = [];

            if (canViewDrafts) {
                // Admins/Instructors see everything, sorted by last update
                if (category) constraints.push(where("category.en", "==", category));
                constraints.push(orderBy("updatedAt", "desc"));
            } else {
                // Students/Guests see only published, sorted by publish date
                constraints.push(where("status", "==", "published"));
                if (category) constraints.push(where("category.en", "==", category));
                constraints.push(orderBy("publishedAt", "desc"));
            }

            // Pagination logic
            if (!reset && lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            constraints.push(limit(POSTS_PER_PAGE));
            const q = query(postsRef, ...constraints);

            const snapshot = await getDocs(q);
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // We return both posts and the new lastDoc
            return {
                posts: fetchedPosts,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
                hasMore: snapshot.docs.length === POSTS_PER_PAGE,
                reset // Pass this back to help the reducer know what to do
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPostBySlug = createAsyncThunk(
    'blog/fetchPostBySlug',
    async (slug, { rejectWithValue, getState }) => {
        try {
            const { userProfile } = getState().auth;
            const canViewDrafts = userProfile?.role === 'instructor' || userProfile?.isAdmin === true;

            const postsRef = collection(db, "blog_posts");
            let constraints = [where("slug", "==", slug), limit(1)];

            // Only filter by published if NOT authorized
            if (!canViewDrafts) {
                constraints.push(where("status", "==", "published"));
            }

            const q = query(postsRef, ...constraints);
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                return {
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data()
                };
            } else {
                return rejectWithValue("Post not found");
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRelatedPosts = createAsyncThunk(
    'blog/fetchRelatedPosts',
    async ({ category, currentPostId, limitCount = 3 }, { rejectWithValue }) => {
        try {
            const postsRef = collection(db, "blog_posts");
            const q = query(
                postsRef,
                where("status", "==", "published"),
                where("category.en", "==", category),
                orderBy("publishedAt", "desc"),
                limit(limitCount + 1) // Fetch one extra to handle filtering current post
            );

            const snapshot = await getDocs(q);
            const posts = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(post => post.id !== currentPostId)
                .slice(0, limitCount);

            return posts;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// ============================================
// SLICE
// ============================================

const initialState = {
    posts: [],
    currentPost: null,
    relatedPosts: [],
    loading: false,
    error: null,
    hasMore: true,
    lastDoc: null, // Non-serializable (Firestore Doc) - Ignored in store.js
};

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        clearCurrentPost: (state) => {
            state.currentPost = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // -------- FETCH POSTS --------
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                const { posts, lastDoc, hasMore, reset } = action.payload;

                if (reset) {
                    state.posts = posts;
                } else {
                    state.posts = [...state.posts, ...posts];
                }

                state.lastDoc = lastDoc;
                state.hasMore = hasMore;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // -------- FETCH SINGLE POST --------
            .addCase(fetchPostBySlug.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPostBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPost = action.payload;
            })
            .addCase(fetchPostBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // -------- FETCH RELATED --------
            .addCase(fetchRelatedPosts.fulfilled, (state, action) => {
                state.relatedPosts = action.payload;
            });
    }
});

export const { clearCurrentPost, clearError } = blogSlice.actions;

// Selectors
export const selectBlogPosts = (state) => state.blog.posts;
export const selectCurrentPost = (state) => state.blog.currentPost;
export const selectRelatedPosts = (state) => state.blog.relatedPosts;
export const selectBlogLoading = (state) => state.blog.loading;
export const selectBlogError = (state) => state.blog.error;
export const selectBlogHasMore = (state) => state.blog.hasMore;

export default blogSlice.reducer;
