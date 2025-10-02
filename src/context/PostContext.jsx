import { createContext, useContext, useState } from "react";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [isPosting, setIsPosting] = useState(false);

  return (
    <PostContext.Provider value={{ isPosting, setIsPosting }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => useContext(PostContext);
