import Lottie from "lottie-react";
import loaderAnimation from "../../assets/loader.json";

export default function LottieSpinner({ size = 28 }) {
  return (
    <div style={{ width: size, height: size }}>
      <Lottie
        animationData={loaderAnimation}
        loop
        autoplay
      />
    </div>
  );
}
