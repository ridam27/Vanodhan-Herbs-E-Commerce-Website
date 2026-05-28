export default function Hero() {
    return (
        <section className="w-full pt-40 pb-24 bg-green-50">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

                <div>
                    <p className="text-green-700 font-semibold mb-4">
                        Rooted in Nature, Committed to Wellness
                    </p>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Pure Ayurvedic Wellness for Everyday Life
                    </h1>

                    <p className="text-gray-600 text-lg mb-8">
                        Discover natural and authentic Ayurvedic products crafted to support your health and lifestyle.
                    </p>

                    <button className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition">
                        Shop Now
                    </button>
                </div>

                <div className="flex justify-center">
                    <img
                        src="https://plus.unsplash.com/premium_photo-1661574859504-d706763e4f3e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Ayurvedic Products"
                        className="w-full h-[500px] object-cover rounded-2xl shadow-lg"
                    />
                </div>

            </div>
        </section>
    );
}