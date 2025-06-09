import React from "react";
import YouTube from "react-youtube";

const VideoPlayer = ({ video, height, width }) => {
  const id = video.split("/").pop();
  const opts = {
    height: height,
    width: width,
    playerVars: {
      autoplay: 0,
    },
  };

  return <YouTube videoId={id} opts={opts} />;
};

export default VideoPlayer;
