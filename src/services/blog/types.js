/**
 * @typedef {Object} BlogPost
 * @property {string} id - The unique identifier for the blog post.
 * @property {string} title_en - The English title of the blog post.
 * @property {string} title_ar - The Arabic title of the blog post.
 * @property {string} content_en - The English content of the blog post (HTML or Markdown).
 * @property {string} content_ar - The Arabic content of the blog post (HTML or Markdown).
 * @property {string} slug - The unique, language-agnostic slug for the URL.
 * @property {string} excerpt_en - A short English summary of the post.
 * @property {string} excerpt_ar - A short Arabic summary of the post.
 * @property {string} featured_image - The URL or path to the featured image in Firebase Storage.
 * @property {string} category_id - The ID of the category this post belongs to.
 * @property {string[]} tags - An array of tags associated with the post.
 * @property {string} author_id - The ID of the user who authored the post.
 * @property {string} author_name_en - The English name of the author.
 * @property {string} author_name_ar - The Arabic name of the author.
 * @property {'draft' | 'published' | 'archived'} status - The publication status of the post.
 * @property {boolean} is_deleted - Flag for soft deletion.
 * @property {import('firebase/firestore').Timestamp} created_at - The timestamp when the post was created.
 * @property {import('firebase/firestore').Timestamp} updated_at - The timestamp when the post was last updated.
 * @property {import('firebase/firestore').Timestamp} published_at - The timestamp when the post was published.
 * @property {number} views - The number of views the post has received.
 * @property {number} likes - The number of likes the post has received.
 * @property {number} shares - The number of times the post has been shared.
 */

/**
 * @typedef {Object} BlogCategory
 * @property {string} id - The unique identifier for the category.
 * @property {string} name_en - The English name of the category.
 * @property {string} name_ar - The Arabic name of the category.
 * @property {string} slug - The unique slug for the category URL.
 * @property {string} description_en - A short English description of the category.
 * @property {string} description_ar - A short Arabic description of the category.
 */

/**
 * @typedef {Object} BlogTag
 * @property {string} id - The unique identifier for the tag.
 * @property {string} name_en - The English name of the tag.
 * @property {string} name_ar - The Arabic name of the tag.
 * @property {string} slug - The unique slug for the tag.
 */

export {};