export default function Loading({ style = 'h-screen' }) {
    return (
        <main className={`flex items-center justify-center ${style}`}>
            <div
                className="
          w-[20px] aspect-square rounded-full
          bg-[#fe2c55]
          animate-clockwise
        "
            />
            <div
                className="
          w-[20px] aspect-square rounded-full
          bg-[#25f4ee] mix-blend-darken
          -ml-1.5
          animate-counter-clockwise
        "
            />
        </main>
    )
}