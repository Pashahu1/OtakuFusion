function AboutPage() {
  return (
    <div className="flex flex-col items-center gap-y-[20px] justify-start min-h-screen bg-[#111111] pt-[100px] px-4 md:px-0">
      <h1 className="text-5xl font-extrabold text-center text-white">
        About OtakuFusion
      </h1>

      <div className="bg-[#1a1a1a] rounded-xl shadow-lg p-8 max-w-3xl text-white flex flex-col gap-6">
        <p className="text-lg leading-relaxed">
          Anime is loved all around the world, and millions of people search for
          anime online every month. With so many free anime sites available, not
          all of them are equally safe or convenient. That’s why we created{' '}
          <span className="font-semibold">OtakuFusion</span> – a simple and safe
          way for anime fans to watch their favorite series online.
        </p>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">1. What is OtakuFusion?</h2>
          <p className="text-lg leading-relaxed">
            OtakuFusion is a free site to watch anime online. You can stream
            subbed or dubbed episodes in good quality without any registration
            or payment. We keep ads minimal to make the experience as
            comfortable as possible.
          </p>

          <h2 className="text-2xl font-bold">2. Is OtakuFusion safe?</h2>
          <p className="text-lg leading-relaxed">
            Yes! We carefully monitor ads on our site to ensure they are safe.
            If you ever notice anything suspicious, please let us know, and
            we’ll remove it quickly.
          </p>

          <h2 className="text-2xl font-bold">
            3. Why OtakuFusion is a great choice for anime fans:
          </h2>
          <ul className="list-disc list-inside text-lg leading-relaxed flex flex-col gap-2 mt-2">
            <li>
              You’ll find popular, classic, and new titles from genres like
              action, drama, fantasy, romance, comedy, and more.
            </li>
            <li>
              Subtitles in English and dubbed versions in multiple languages are
              available.
            </li>
            <li>
              Video quality: Watch in different resolutions – from 360p to 1080p
              – so you can enjoy anime even if your internet connection is slow.
            </li>
            <li>
              Easy to use: The site is simple to navigate. Search for a specific
              title or explore new releases and categories to find something you
              like.
            </li>
            <li>
              Regular updates: We add new series frequently and listen to user
              requests. There’s always something new to watch.
            </li>
            <li>
              Device support: OtakuFusion works on both desktop and mobile. For
              the best streaming experience, we recommend using a desktop.
            </li>
            <li>
              User support: We respond quickly to questions and content requests
              to make your experience enjoyable.
            </li>
          </ul>
        </div>

        <p className="text-lg leading-relaxed mt-4">
          If you’re looking for a safe and convenient way to watch anime online,
          give <span className="font-semibold">OtakuFusion</span> a try. If you
          enjoy it, share it with your friends and don’t forget to bookmark our
          site!
        </p>

        <p className="text-lg text-center mt-4 font-medium text-[#f0c040]">
          Join us in celebrating the world of anime!
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
