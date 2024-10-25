import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Post {
  id: string;
  description: string;
  image_path: string;
  likesCount: number;
  liked: boolean;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
}

interface PostState {
  posts: Post[];
}

const initialState: PostState = {
  posts: [],
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts = [action.payload, ...state.posts];
    },
    updateLike: (state, action: PayloadAction<{ postId: string; likesCount: number; liked: boolean }>) => {
      const postIndex = state.posts.findIndex(post => post.id === action.payload.postId);
      if (postIndex !== -1) {
        state.posts[postIndex].likesCount = action.payload.likesCount;
        state.posts[postIndex].liked = action.payload.liked;
      }
    },
    updatePost: (state, action: PayloadAction<{ id: string; description: string; image_path: string }>) => {
      const postIndex = state.posts.findIndex(post => post.id === action.payload.id);
      if (postIndex !== -1) {
        state.posts[postIndex].description = action.payload.description;
        state.posts[postIndex].image_path = action.payload.image_path;
      }
    },
  },
});

export const { setPosts, addPost, updateLike, updatePost } = postSlice.actions;

export default postSlice.reducer;
