'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col gap-[10px] items-center justify-center h-screen bg-black text-white text-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,0,0,0.15)_0%,transparent_70%)] animate-pulse blur-3xl"></div>
        <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-[spin_40s_linear_infinite] blur-2xl"></div>
      </div>

      <div className="z-10 animate-bounce">
        <Image
          width={400}
          height={200}
          src="/sukuna-404.png"
          alt="error-404"
          className="drop-shadow-[0_0_20px_rgba(255,0,0,0.7)]"
        />
      </div>

      <h1 className="relative text-7xl font-extrabold mt-6 tracking-widest text-red-500 glitch">
        404
      </h1>

      <p className="text-xl mt-3 text-gray-300">
        Oops... The page you’re looking for doesn’t exist.
      </p>

      <button
        className="w-[220px] h-[55px] mt-8 bg-red-600 text-lg font-semibold rounded-2xl shadow-lg shadow-red-500/40 transition-transform transform hover:scale-105 relative overflow-hidden"
        onClick={() => router.push('/')}
        aria-label="Return to Home Page"
      >
        <span className="relative z-10">Return Home</span>
        <div className="absolute inset-0 bg-red-500 opacity-40 blur-xl animate-pulse"></div>
      </button>

      <style jsx>{`
        .glitch {
          position: relative;
          color: #ff3d3d;
          text-shadow:
            0 0 10px rgba(255, 0, 0, 0.8),
            0 0 20px rgba(255, 0, 0, 0.6),
            0 0 40px rgba(255, 0, 0, 0.4);
          animation: glitch 2s infinite;
        }

        .glitch::before,
        .glitch::after {
          content: '404';
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          overflow: hidden;
          color: #ff0000;
          clip: rect(0, 900px, 0, 0);
        }

        .glitch::before {
          animation: glitchTop 2s infinite linear alternate-reverse;
          color: #00fff7;
        }

        .glitch::after {
          animation: glitchBottom 1.5s infinite linear alternate-reverse;
          color: #ff00ff;
        }

        @keyframes glitch {
          0% {
            text-shadow:
              2px 2px red,
              -2px -2px blue;
          }
          20% {
            text-shadow:
              -2px 0 red,
              2px 2px blue;
          }
          40% {
            text-shadow:
              2px -2px red,
              -2px 0 blue;
          }
          60% {
            text-shadow:
              0 2px red,
              2px -2px blue;
          }
          80% {
            text-shadow:
              -2px -2px red,
              0 2px blue;
          }
          100% {
            text-shadow:
              2px 2px red,
              -2px -2px blue;
          }
        }

        @keyframes glitchTop {
          0% {
            clip: rect(0, 9999px, 0, 0);
          }
          10% {
            clip: rect(10px, 9999px, 40px, 0);
          }
          20% {
            clip: rect(85px, 9999px, 140px, 0);
          }
          30% {
            clip: rect(45px, 9999px, 80px, 0);
          }
          40% {
            clip: rect(10px, 9999px, 50px, 0);
          }
          50% {
            clip: rect(60px, 9999px, 90px, 0);
          }
          100% {
            clip: rect(0, 9999px, 0, 0);
          }
        }

        @keyframes glitchBottom {
          0% {
            clip: rect(0, 9999px, 0, 0);
          }
          10% {
            clip: rect(55px, 9999px, 90px, 0);
          }
          20% {
            clip: rect(120px, 9999px, 160px, 0);
          }
          30% {
            clip: rect(20px, 9999px, 60px, 0);
          }
          40% {
            clip: rect(85px, 9999px, 130px, 0);
          }
          50% {
            clip: rect(40px, 9999px, 70px, 0);
          }
          100% {
            clip: rect(0, 9999px, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
