import React from "react";
import { Box, Grid } from "@mui/material";
import BlogCard, { BlogCardSkeleton } from "./BlogCard";

function BlogGrid({ posts, loading, compact = false, onDelete }) {
    if (loading && posts.length === 0) {
        return (
            <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid item xs={12} sm={6} md={compact ? 4 : 6} key={i}>
                        <BlogCardSkeleton compact={compact} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <Grid container spacing={3}>
            {posts.map((post) => (
                <Grid item xs={12} sm={6} md={compact ? 4 : 6} key={post.id}>
                    <BlogCard post={post} compact={compact} onDelete={onDelete} />
                </Grid>
            ))}
        </Grid>
    );
}

export default BlogGrid;
