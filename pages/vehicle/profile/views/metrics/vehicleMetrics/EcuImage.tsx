import React from "react";
import AsyncImg from "../../../../../../components/extras/AsyncImg";

interface EcuImageProps {
  imageId?: string | null;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

const EcuImage: React.FC<EcuImageProps> = ({ imageId, fallbackSrc, alt, className = "" }) => {
  if (imageId) {
    return <AsyncImg id={imageId} className={className} />;
  }

  return <img src={fallbackSrc} alt={alt} className={className} />;
};

export default EcuImage;
