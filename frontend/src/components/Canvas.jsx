import { useRef, useEffect, useState, useContext } from "react";
import loaderImgSrc from "../assets/loader_img.svg";
import planeImgSrc from "../assets/plane.png";
import bgImgSrc from "../assets/bg-rotate.svg";
import { useSoundContext } from "../context/SoundContext.jsx";
import { EnginContext } from "../context/EnginContext.jsx";
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
};

const drawRoundedRect = (ctx, x, y, width, height, radius, fillStyle) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
};

// Arc-length parametrization utilities
const createArcLengthLUT = (getPoint, steps = 100) => {
  const lut = [{ t: 0, length: 0 }];
  let prev = getPoint(0);
  let length = 0;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const curr = getPoint(t);
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    length += Math.sqrt(dx * dx + dy * dy);
    lut.push({ t, length });
    prev = curr;
  }

  return lut;
};

const mapArcLengthToT = (lut, distance) => {
  if (distance <= 0) return 0;
  if (distance >= lut[lut.length - 1].length) return 1;

  for (let i = 1; i < lut.length; i++) {
    const prev = lut[i - 1];
    const curr = lut[i];
    if (distance <= curr.length) {
      const ratio = (distance - prev.length) / (curr.length - prev.length);
      return prev.t + ratio * (curr.t - prev.t);
    }
  }

  return 1;
};

const Canvas = () => {
  const { score, isLoadingRef } = useContext(EnginContext);
  const crashScore = useRef((Math.random() * (5 - 1 + 1) + 1).toFixed(2)); // it will come from backend
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const { playCrash, playTakeoff, playWin } = useSoundContext();

  const progressRef = useRef(1);
  const loaderImgRotationRef = useRef(0);
  const imagesRef = useRef({});
  const takeoffLUTRef = useRef(null);
  const loopLUTRef = useRef(null);
  const scoreSpeed = useRef(0.0005);
  const scoreSpeedAcceleration = useRef(0.006);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastDrawTime = 0;
    let angle = 0;
    let distanceT = 0;
    let loopDistanceT = 0;
    let looping = false;
    let direction = true;
    const speed = 2;
    const planeScale = 0.5;
    const scale = Math.min(Math.max(canvas.width / 800, 0.6), 1.5);
    const scorefontSize = Math.max(70, canvas.width * 0.05);

    const colors = [
      { r: 52, g: 180, b: 255 }, // Blue
      { r: 145, g: 62, b: 248 }, // Purple
      { r: 192, g: 23, b: 180 }, // Pink
    ];
    // Current color (start with first color)
    let currentColor = { r: 52, g: 180, b: 255 };
    let targetColor = { r: 52, g: 180, b: 255 };
    let backgroundOpacity = 0;
    let targetOpacity = 1;

    const getCubicBezierXY = (t, p0, p1, p2, p3) => {
      const x =
        Math.pow(1 - t, 3) * p0.x +
        3 * Math.pow(1 - t, 2) * t * p1.x +
        3 * (1 - t) * t * t * p2.x +
        t * t * t * p3.x;
      const y =
        Math.pow(1 - t, 3) * p0.y +
        3 * Math.pow(1 - t, 2) * t * p1.y +
        3 * (1 - t) * t * t * p2.y +
        t * t * t * p3.y;
      return { x, y };
    };

    const handleBackgroundColor = () => {
      if (isLoadingRef.current === false) {
        targetOpacity = 1;
        angle += 0.005;
      } else {
        targetOpacity = 0;
      }

      const opacityLerpAmount = 0.05;
      backgroundOpacity +=
        (targetOpacity - backgroundOpacity) * opacityLerpAmount;

      if (score.current < 2) {
        targetColor = colors[0];
      } else if (score.current < 10) {
        targetColor = colors[1];
      } else {
        targetColor = colors[2];
      }
      const lerpAmount = 0.05; // transition speed

      currentColor.r += (targetColor.r - currentColor.r) * lerpAmount;
      currentColor.g += (targetColor.g - currentColor.g) * lerpAmount;
      currentColor.b += (targetColor.b - currentColor.b) * lerpAmount;

      const centerColor = `rgba(${currentColor.r.toFixed(
        0
      )}, ${currentColor.g.toFixed(0)}, ${currentColor.b.toFixed(0)}, ${
        0.7 * backgroundOpacity
      })`;
      const midColor = `rgba(${currentColor.r.toFixed(
        0
      )}, ${currentColor.g.toFixed(0)}, ${currentColor.b.toFixed(0)}, ${
        0.3 * backgroundOpacity
      })`;
      const edgeColor = `rgba(0,0,0,${0.2 * backgroundOpacity})`;

      // background color
      ctx.save();

      ctx.translate(canvas.width / 2, canvas.height / 2);
      const eggShapeX = 1.3;
      const eggShapeY = 1.0;
      ctx.scale(eggShapeX, eggShapeY);
      const radius = Math.max(canvas.width, canvas.height) * 0.36;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);

      gradient.addColorStop(0, centerColor);
      gradient.addColorStop(0.4, midColor);
      gradient.addColorStop(1, edgeColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );

      ctx.restore();
    };
    const handleBackground = () => {
      const { bgImg } = imagesRef.current;
      if (!bgImg) return;
      ctx.save();
      ctx.translate(0, canvas.height);
      ctx.rotate(angle);
      ctx.drawImage(bgImg, -bgImg.width / 2, -bgImg.height / 2);
      ctx.restore();
      handleBackgroundColor();
    };

    const staticPlaneStart = (planeImg) => ({
      x: canvas.width * 0.01,
      y: canvas.height - planeImg.height * planeScale - 10,
    });

    const handlePlane = () => {
      if (isLoadingRef.current) return;
      const { planeImg } = imagesRef.current;
      if (!planeImg?.complete || planeImg.naturalWidth === 0) return;
      const planePos = staticPlaneStart(planeImg);
      const MOBILE_BREAKPOINT = 320;
      const DESKTOP_BREAKPOINT = 1200;
      const MIN_VALUE = 0.045;
      const MAX_VALUE = 0.135;

      const ratio =
        (canvas.width - MOBILE_BREAKPOINT) /
        (DESKTOP_BREAKPOINT - MOBILE_BREAKPOINT);
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      const dynamicValue = MAX_VALUE - clampedRatio * (MAX_VALUE - MIN_VALUE);
      const P0 = {
        x: planePos.x + dynamicValue * canvas.width,
        y: planePos.y + planeImg.height * planeScale - 23.3,
      };
      const P1 = { x: P0.x + 0.02 * canvas.width, y: P0.y };
      const P2 = { x: canvas.width * 0.7, y: canvas.height };
      const P3 = {
        x: canvas.width * 0.7,
        y: canvas.height * 0.1,
      };
      const P4 = { x: canvas.width * 0.77, y: canvas.height * 0.15 };
      const P5 = { x: canvas.width * 0.81, y: canvas.height * 0.4 };
      const P6 = { x: canvas.width * 0.85, y: canvas.height * 0.6 };

      if (!takeoffLUTRef.current || !loopLUTRef.current) {
        const takeoffCurve = (tt) => getCubicBezierXY(tt, P0, P1, P2, P3);
        const loopCurve = (tt) => getCubicBezierXY(tt, P3, P4, P5, P6);
        takeoffLUTRef.current = createArcLengthLUT(takeoffCurve);
        loopLUTRef.current = createArcLengthLUT(loopCurve);
      }

      const takeoffLUT = takeoffLUTRef.current;
      const loopLUT = loopLUTRef.current;
      const takeoffLength = takeoffLUT[takeoffLUT.length - 1].length;
      const loopLength = loopLUT[loopLUT.length - 1].length;

      let pos;
      let bezT = 0;
      // if (score.current >= crashScore.current) {
      //   pos = {
      //     x: canvas.width + 500,
      //     y: P0.y,
      //   };
      // }
      if (distanceT <= takeoffLength) {
        bezT = mapArcLengthToT(takeoffLUT, distanceT);
        pos = getCubicBezierXY(bezT, P0, P1, P2, P3);
        distanceT += speed;
      } else {
        if (!looping) {
          looping = true;
          loopDistanceT = 0;
          direction = true;
        }

        const easeInOutQuad = (t) =>
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const easedLoopDistanceT =
          easeInOutQuad(loopDistanceT / loopLength) * loopLength;
        const bezT = mapArcLengthToT(
          loopLUT,
          direction ? easedLoopDistanceT : loopLength - easedLoopDistanceT
        );
        pos = getCubicBezierXY(bezT, P3, P4, P5, P6);

        loopDistanceT += speed * 0.5;
        if (loopDistanceT >= loopLength) {
          loopDistanceT = 0;
          direction = !direction;
        }
      }

      pos.y = Math.min(Math.max(pos.y, 0), canvas.height);

      // the tail
      const handleTail = () => {
        const planeWidth = planeImg.width * planeScale;
        const planeHeight = planeImg.height * planeScale;

        const tailEnd = {
          x: pos.x - planeWidth / 2 + 15,
          y: pos.y + planeHeight / 2 - 3,
        };
        const tailStart = {
          x: 0,
          y: canvas.height,
        };

        // Control points
        const cp1 = {
          x: tailStart.x + (tailEnd.x - tailStart.x) * 0.6,
          y:
            tailStart.y +
            (tailEnd.y - tailStart.y) * 0.1 -
            0.1 * Math.abs(tailEnd.y - tailStart.y),
        };
        const cp2 = {
          x: tailStart.x + (tailEnd.x - tailStart.x) * 0.7,
          y:
            tailStart.y +
            (tailEnd.y - tailStart.y) * 0.5 +
            0.1 * Math.abs(tailEnd.y - tailStart.y),
        };
        {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          ctx.lineTo(tailStart.x, canvas.height);
          ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, tailEnd.x, tailEnd.y);
          ctx.lineTo(pos.x - 35, canvas.height);
          ctx.closePath();

          ctx.clip(); // Clip the area below the tail

          ctx.fillStyle = "rgba(255,0,0,0.5)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.restore();
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tailStart.x, tailStart.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, tailEnd.x, tailEnd.y);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      };
      handleTail();

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.drawImage(
        planeImg,
        (-planeImg.width * planeScale) / 2,
        (-planeImg.height * planeScale) / 2,
        planeImg.width * planeScale,
        planeImg.height * planeScale
      );
      ctx.restore();
    };
    const handleLoading = () => {
      const { loaderImg, planeImg } = imagesRef.current;
      if (!loaderImg || !planeImg) return;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const imgSize = 100 * scale;
      const textSize = 24 * scale;
      const barHeight = 7 * scale;
      const spacing = 20 * scale;
      const totalHeight = imgSize + spacing + textSize + spacing + barHeight;
      const startY = centerY - totalHeight / 2;

      ctx.save();
      ctx.translate(centerX, startY + imgSize / 2);
      ctx.rotate(loaderImgRotationRef.current);
      ctx.drawImage(loaderImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
      ctx.restore();
      loaderImgRotationRef.current += 0.05;

      ctx.font = `${textSize}px Arial, sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(
        "Waiting For Next Round",
        centerX,
        startY + imgSize + textSize / 2 + spacing
      );

      const barWidth = 200 * scale;
      const barX = centerX - barWidth / 2;
      const barY = startY + imgSize + spacing + textSize / 2 + spacing;

      drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 5, "#444");
      drawRoundedRect(
        ctx,
        barX,
        barY,
        barWidth * progressRef.current,
        barHeight,
        5,
        "#ff0000"
      );

      const planePos = staticPlaneStart(planeImg);
      ctx.drawImage(
        planeImg,
        planePos.x,
        planePos.y,
        planeImg.width * planeScale,
        planeImg.height * planeScale
      );

      progressRef.current -= 0.003;
      if (progressRef.current <= 0) {
        progressRef.current = 0;
        playTakeoff();
      }
    };
    const handleScore = (deltaTime) => {
      ctx.font = `bold ${scorefontSize}px Arial, sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${score.current.toFixed(2)}x`,
        canvas.width / 2,
        canvas.height / 2
      );
      if (crashScore.current > score.current) {
        score.current += (deltaTime / 1000) * scoreSpeed.current;
        if (score.current < 150) {
          scoreSpeed.current +=
            (deltaTime / 1000) * scoreSpeedAcceleration.current;
        }
      }
    };
    const handleCrash = () => {
      const scoreMetrics = ctx.measureText(score.current.toFixed(2));
      const scoreHeight =
        scoreMetrics.actualBoundingBoxAscent +
        scoreMetrics.actualBoundingBoxDescent;
      const gap = scorefontSize * 0.2;

      playCrash();
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.font = `${scorefontSize / 2}px Arial, sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.fillText(
        `FLEW AWAY`,
        canvas.width / 2,
        canvas.height / 2 - (scoreHeight + gap)
      );
      ctx.font = `bold ${scorefontSize}px Arial, sans-serif`;
      ctx.fillStyle = "#f00";
      ctx.fillText(
        `${crashScore.current}x`,
        canvas.width / 2,
        canvas.height / 2
      );
    };

    const draw = (timestamp) => {
      if (!ctx) return;
      const deltaTime = timestamp - lastDrawTime;
      if (score.current <= crashScore.current) {
        if (deltaTime < 1000 / 60) {
          animationFrameRef.current = requestAnimationFrame(draw);
          return;
        }
        lastDrawTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleBackground();
        if (progressRef.current > 0) {
          handleLoading();
          isLoadingRef.current = true;
        } else {
          isLoadingRef.current = false;
          handlePlane();
          handleScore(deltaTime);
        }
        animationFrameRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        isLoadingRef.current = true;
        handleBackgroundColor();
        handleCrash();
        setTimeout(() => {
          resetGameState();
        }, 3000);
      }
    };
    const resetGameState = () => {
      angle = 0;
      distanceT = 0;
      loopDistanceT = 0;
      looping = false;
      direction = true;
      score.current = 1;
      scoreSpeed.current = 0.0005;
      progressRef.current = 1;
      crashScore.current = (Math.random() * (5 - 1 + 1) + 1).toFixed(2);
      startAnimation();
    };
    const startAnimation = async () => {
      try {
        const [bgImg, loaderImg, planeImg] = await Promise.all([
          loadImage(bgImgSrc),
          loadImage(loaderImgSrc),
          loadImage(planeImgSrc),
        ]);
        imagesRef.current = { bgImg, loaderImg, planeImg };
        animationFrameRef.current = requestAnimationFrame(draw);
      } catch (error) {
        console.error("Failed to load images:", error);
      }
    };
    startAnimation();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </>
  );
};

export default Canvas;
