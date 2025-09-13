import React from "react";
import { Skeleton } from "@mui/material";

const LazyImage = ({ src, alt, ...props }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageSrc, setImageSrc] = React.useState(null);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  if (isLoading) {
    return <Skeleton variant="rectangular" {...props} />;
  }

  return <img src={imageSrc} alt={alt} {...props} />;
};

export default LazyImage;
