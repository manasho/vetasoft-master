import React, { useState, useEffect } from 'react';

const Carousel = ({ images = [], interval = 4500 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const id = setInterval(() => setIndex(i => (i + 1) % images.length), interval);
    return () => clearInterval(id);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setIndex(i => (i + 1) % images.length);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
      <div style={{ display: 'flex', width: `${images.length * 100}%`, transform: `translateX(-${index * (100 / images.length)}%)`, transition: 'transform 500ms ease' }}>
        {images.map((src, i) => (
          <div key={i} style={{ minWidth: `${100 / images.length}%`, height: 320, backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ))}
      </div>

      <button aria-label="Anterior" onClick={prev} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>
        ‹
      </button>
      <button aria-label="Siguiente" onClick={next} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>
        ›
      </button>

      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} aria-label={`Ir a ${i + 1}`} style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', background: i === index ? 'white' : 'rgba(255,255,255,0.6)', cursor: 'pointer' }} />
        ))}
      </div>
    </div>
  );
};

const Home = ({ showSection }) => {
  const images = [
    'https://images.unsplash.com/photo-1632236542159-809925d85fc0?q=1600&q=80&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1577175889968-f551f5944abd?q=1600&q=80&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ];

  return (
    <div className="section home-section">
      <div className="hero">
        <h1>Bienvenido a Vetasoft</h1>
        <p>Tu sistema integral para la gestión veterinaria</p>

        <div style={{ marginTop: 18 }}>
          <Carousel images={images} />
        </div>
      </div>
      {/* Nuestros servicios */}
      <div className="services-section" style={{ marginTop: 30 }}>
        <div className="services-container">
          <div className="services-left">
            <h2>NUESTROS SERVICIOS</h2>
            <p className="services-desc">Nuestra clínica está equipada con equipos y tecnología de diagnóstico avanzados que nos permiten realizar evaluaciones precisas y brindar un diagnóstico rápido. Desde radiografías y ecografías hasta análisis de laboratorio especializados, tenemos todo lo necesario para evaluar la salud de su mascota de manera integral.</p>
            <button className="btn btn-primary" onClick={() => showSection('appointments')}>PROGRAMAR UNA CONSULTA MÉDICA</button>
          </div>

          <div className="services-grid">
            <div className="service-item">📋<span>CONSULTA MÉDICA</span></div>
            <div className="service-item">🖥️<span>ECOGRAFÍA</span></div>
            <div className="service-item">🔪<span>CIRUGÍAS</span></div>
            <div className="service-item">💧<span>LABORATORIO CLÍNICO</span></div>
            <div className="service-item">💉<span>VACUNACIÓN</span></div>
            <div className="service-item">🏥<span>HOSPITALIZACIÓN</span></div>
            <div className="service-item">⚡<span>RAYOS X</span></div>
            <div className="service-item">❤️<span>PLANES DE MEDICINA</span></div>
          </div>
        </div>
      </div>
      
      {/*Especialización de la veterinaria*/}
      <div className="services-section" style={{ marginTop: 30 }}>
        <div className="services-container">
          <div className="services-left">
            <img src="https://i.pinimg.com/736x/32/e9/be/32e9be08a8d2cc2890d5004d4ab97050.jpg"
              alt="Visión"
              className="service-icon"/>
            <h2>VISION</h2>
            <p className="services-desc">Ser reconocidos como la clínica veterinaria líder en la atención integral de razas braquicéfalas, ofreciendo servicios de alta calidad, innovación y especialización, contribuyendo al bienestar de los animales y educando a sus propietarios sobre el cuidado y prevención de enfermedades asociadas a estas razas.</p>
          </div>
           <div className="services-left">
            <img src="https://i.pinimg.com/736x/06/20/8e/06208ebb83dd0df7a12874d6b1eda352.jpg"
              alt="Misión"
              className="service-icon"/>
            <h2>MISION</h2>
            <p className="services-desc">​Brindar atención veterinaria especializada y personalizada a perros y gatos braquicéfalos, garantizando un enfoque integral en su salud, desde la prevención hasta el tratamiento de patologías comunes en estas razas. Nos comprometemos a utilizar tecnología avanzada, mantener un equipo altamente capacitado y fomentar la educación continua para mejorar la calidad de vida.</p>
          </div>
           <div className="services-left">
            <img src="https://i.pinimg.com/1200x/87/a8/ad/87a8ade2331abf96b04e8e44566a3e5e.jpg"
              alt="Misión"
              className="service-icon"/>
            <h2>OBJETIVO</h2>
            <p className="services-desc">Brindar un diagnóstico oportuno y tratamiento especializado para al menos el 90% de los animales braquicéfalos que ingresen a la clínica, reduciendo la morbilidad y mejorando su calidad de vida</p>
          </div>
        </div>
      </div>
      <div className="extra-info-container">
        <div className="extra-info-item">
          <img
            src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
            alt="Atención veterinaria"
            className="extra-info-icon"
          />
          <p>
            Atención especializada en razas braquicéfalas con un enfoque médico
            integral y tecnología avanzada.
          </p>
        </div>
      </div>
      {/*Información de contacto*/}
      <div className="locations-section" style={{ marginTop: 36 }}>
        <div className="locations-container">
          <h2>CONTACTECNOS</h2>
          <div className="locations-grid">
            <div className="location-card">
              <div className="location-body">
                <h3 className="location-title">Dirección</h3>
                <div className="location-sub">Carrera 99a # 26-80 Sur, Casa 22B</div>
                <div className="location-contact">
                  <div><strong>Ciudad</strong></div>
                  <div>Bogota - Colombia</div>
                  <div>Especialistas en Braquiocefálicos</div>
                </div>
                <div className="location-address">
                  <div><strong>Horarios de atención</strong></div>
                  <div>Lunes a domingo 24 horas</div>
                </div>
              </div>
            </div>

            <div className="location-card">
              <div className="location-body">
                <h3 className="location-title">Correo Electronico</h3>
                <div className="location-sub">mascotastierrabuena@gmail.com</div>
                <div className='location-sub'>braquiovet@gmail.com</div>
                <div className="location-contact">
                  <div><strong>TELÉFONOS:</strong></div>
                  <div>+57 300 349 2561</div>
                  <div>+57 324 683 1108</div>
                  <div>+57 324 733 1283</div>
                </div>
              </div>
            </div>

            <div className="location-card">
              <div className="location-body">
                <h3 className="location-title">Nuestras redes</h3>
                <div className="location-sub">Instagram @braquiovetclinicaveterinaria</div>
                <div className="location-sub">Facebook:Braquiovet Braquiocefálicos</div>
                <div className="location-sub">Tiktok:clinicabraquiovet</div>
                <div className="location-contact">
                  <div><strong>¡SIGUENOS!</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;