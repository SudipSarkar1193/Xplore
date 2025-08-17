import React from "react";

const PostBody = ({ content, imageUrls }) => {
  if (!imageUrls || imageUrls.length === 0) return (
    <div className="flex flex-col gap-3 overflow-hidden mb-3">
      <p className="whitespace-pre-wrap open-sans-medium">{content}</p>
    </div>
  );

  const count = imageUrls.length;

  const renderSingleImage = () => (
    <img
      src={imageUrls[0]}
      className="w-full max-h-[600px] object-contain rounded-lg border border-gray-700"
      alt="Post image"
    />
  );

  const renderTwoImages = () => (
    <div className="grid grid-cols-2 gap-2">
      {imageUrls.map((url, index) => (
        <div key={index} className="aspect-w-1 aspect-h-1">
          <img
            src={url}
            className="w-full h-full object-cover rounded-lg border border-gray-700"
            alt={`Post image ${index + 1}`}
          />
        </div>
      ))}
    </div>
  );

  const renderThreeImages = () => (
    <div className="grid grid-cols-2 gap-2">
      <div className="aspect-w-1 aspect-h-2">
        <img
          src={imageUrls[0]}
          className="w-full h-full object-cover rounded-lg border border-gray-700"
          alt="Post image 1"
        />
      </div>
      <div className="grid grid-rows-2 gap-2">
        {imageUrls.slice(1, 3).map((url, index) => (
          <div key={index} className="aspect-w-1 aspect-h-1">
            <img
              src={url}
              className="w-full h-full object-cover rounded-lg border border-gray-700"
              alt={`Post image ${index + 2}`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderFourOrMoreImages = () => (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
      <div className="aspect-w-1 aspect-h-2">
        <img
          src={imageUrls[0]}
          className="w-full h-full object-cover rounded-lg border border-gray-700"
          alt="Post image 1"
        />
      </div>
      {imageUrls.slice(1, 3).map((url, index) => (
        <div key={index} className="aspect-w-1 aspect-h-1">
          <img
            src={url}
            className="w-full h-full object-cover rounded-lg border border-gray-700"
            alt={`Post image ${index + 2}`}
          />
        </div>
      ))}
      <div className="relative aspect-w-1 aspect-h-1">
        <img
          src={imageUrls[3]}
          className="w-full h-full object-cover rounded-lg border border-gray-700"
          alt="Post image 4"
        />
        {count > 4 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">+{count - 4}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderImageGallery = () => {
    if (count === 1) return renderSingleImage();
    if (count === 2) return renderTwoImages();
    if (count === 3) return renderThreeImages();
    return renderFourOrMoreImages();
  };

  return (
    <div className="flex flex-col gap-3 overflow-hidden mb-3">
      <p className="whitespace-pre-wrap open-sans-medium">{content}</p>
      {renderImageGallery()}
    </div>
  );
};

export default PostBody;
