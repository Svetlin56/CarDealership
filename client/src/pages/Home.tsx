export default function Home() {
    return (

        <div className="home-page-center">
            <section className="home-hero rounded-4 overflow-hidden">
                <div className="home-hero-overlay">
                    <div className="container-fluid py-5 px-4 px-md-5">
                        <div className="home-hero-content">
                            <h1 className="display-5 fw-bold text-white">
                                Welcome to Car Dealership
                            </h1>
                            <p className="col-md-8 fs-5 text-white home-hero-text">
                                Discover available vehicles,
                                compare key details, receive ML-powered recommendations,
                                and send inquiries directly to the dealership.
                            </p>


                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}