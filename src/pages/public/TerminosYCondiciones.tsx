import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, ShieldCheck, Scale, FileText } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { Logo } from '../../components/Logo';

export default function TerminosYCondiciones() {
  
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: '1', title: '1. APP y Programas', sub: ['1.1 Naturaleza Educativa', '1.2 Programas y Gestión Emocional'] },
    { id: '2', title: '2. Descripción de Servicios', sub: ['2.1 Descripción General', '2.2 Plataforma en Línea', '2.3 Herramientas Propias', '2.4 Herramientas Disponibles', '2.5 Contenidos Digitales', '2.6 Dinámicas, Retos y Actividades', '2.6.1 Evaluaciones y Reportes', '2.7 Rutas y Segmentación', '2.8 Acceso y Vigencia', '2.9 Credenciales y Activación', '2.10 Recursos Descargables', '2.11 Contenidos Audiovisuales', '2.12 Duración de Acceso', '2.12.1 Alcance Acceso Vitalicio', '2.13 Activación e Integraciones', '2.14 Servicios de Terceros', '2.15 Inteligencia Artificial', '2.15.1 Uso Responsable IA', '2.16 Simuladores y Entornos Práctica', '2.17 Recompensas y Beneficios', '2.18 Sesiones Diagnósticas', '2.19 Comunidades y Canales', '2.20 Comunicaciones Operativas', '2.21 Espacios No Oficiales', '2.22 Contacto de Ingresarios', '2.23 Exclusiones', '2.24 Herramientas Adicionales', '2.25 Actualizaciones y Modificaciones', '2.26 Naturaleza Educativa (Resumen)', '2.27 No Garantía de Resultados'] },
    { id: '3', title: '3. Obligaciones y Conducta', sub: ['3.1 Obligaciones del Usuario'] },
    { id: '4', title: '4. Uso de Imagen y Testimonios', sub: [] },
    { id: '5', title: '5. Garantías', sub: ['5.1 Garantía Legal', '5.2 Procedencia', '5.3 Exclusiones', '5.4 Improcedencia', '5.5 Garantía Satisfacción', '5.6 Condiciones', '5.7 Limitaciones', '5.8 Plataformas de Pago Terceros'] },
    { id: '6', title: '6. Declaración de Riesgos', sub: ['6.1 Advertencia de Riesgos', '6.2 Advertencia Bienestar Emocional'] },
    { id: '7', title: '7. Pago de Servicios', sub: ['7.1 Proveedores', '7.2 Responsabilidad', '7.3 Seguridad', '7.4 Procesamiento', '7.5 Condiciones', '7.6 Cuentas Autorizadas', '7.7 Suscripción Recurrente', 'a. Planes de Pago (7.8, 7.9)', 'b. Pagos a Cuotas (7.10 - 7.15)', 'c. Terminación del Servicio (7.16 - 7.18)'] },
    { id: '8', title: '8. Fuerza Mayor y Disponibilidad', sub: ['8.1 Exclusión de Responsabilidad', '8.2 Dependencia Tecnológica', '8.3 Mantenimiento', '8.4 Restablecimiento'] },
    { id: '9', title: '9. Canales de Atención', sub: ['9.1 Canales de Atención', '9.2 Canales de Comunicación (9.2 - 9.6)'] },
    { id: '10', title: '10. Derecho de Retracto', sub: [] },
    { id: '11', title: '11. Reversión de Pago', sub: ['11.1 Reversión (11.1 - 11.9)'] },
    { id: '12', title: '12. Propiedad Intelectual', sub: ['12.1 Titularidad (12.1 - 12.8)'] },
    { id: '13', title: '13. Ley Aplicable', sub: ['13.1 Ley Aplicable (13.1 - 13.11)'] },
    { id: '14', title: '14. Aceptación de Términos', sub: ['14.1 Aceptación (14.1 - 14.6)'] },
    { id: '15', title: '15. Advertencia Final', sub: ['15.1 Advertencia Final (15.1 - 15.5)'] }
  ];

  const handleScroll = (id: string) => {
    const element = document.getElementById(`seccion-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-white flex flex-col relative overflow-hidden">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-emerald/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"></div>

      {/* Header */}
      <header className="border-b border-white/5 bg-[#05080f]/80 backdrop-blur-md sticky top-0 z-50 w-full py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2 text-white/50 hover:text-brand-blue transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la App</span>
          </Link>
          <Logo imgClassName="h-6 md:h-8 w-auto object-contain" taglineClassName="text-[6px]" />
          <div className="w-24 hidden md:block"></div> {/* Spacer for symmetry */}
        </div>
      </header>

      {/* Hero Header Banner */}
      <section className="relative py-12 md:py-16 border-b border-white/5 bg-gradient-to-b from-brand-blue/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-mono uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" /> Marco Contractual
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-wide uppercase">
            Términos y Condiciones
          </h1>
          <p className="text-sm md:text-base text-white/55 font-mono max-w-2xl mx-auto">
            Plataforma Educativa GENY LAB · Reditum Group S.A.S.
          </p>
          <div className="flex justify-center gap-6 pt-2 text-xs text-white/40 font-mono">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Entrada en Vigencia: 27 de Mayo, 2026</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Documento Oficial</span>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 relative">
        
        {/* Sticky Table of Contents (Desktop Only) */}
        <aside className="hidden lg:block sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-4 space-y-6 scrollbar-thin">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white/45 tracking-widest uppercase">
              <BookOpen className="w-4 h-4 text-brand-blue" />
              <span>Índice</span>
            </div>
            <nav className="space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleScroll(sec.id)}
                  className="w-full text-left text-xs py-2 px-2.5 rounded-lg text-white/40 hover:text-brand-blue hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all flex items-center justify-between group"
                >
                  <span className="truncate font-semibold tracking-wide">{sec.title}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] text-brand-blue font-mono font-bold transition-opacity">→</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Body */}
        <article className="space-y-12 max-w-3xl lg:max-w-none text-white/70 leading-relaxed font-sans text-sm md:text-base pr-0 lg:pr-8">
          
          <div className="glass-panel p-6 border border-white/5 bg-white/[0.01] rounded-2xl">
            <p className="text-white/80 leading-relaxed">
              Los siguientes serán los términos y condiciones contractuales que fijan las reglas respecto a la relación que existe entre <strong>Reditum Group SAS</strong>, identificado con <strong>NIT 900.329.762-2</strong>, incluidos los que se gestionen a través de la marca <strong>INGRESARIOS</strong> (en adelante, <strong>"INGRESARIOS"</strong>), y el interesado/usuario/cliente/alumno/participante o tercero (en adelante, <strong>"Usuario"</strong> y/o <strong>"Usuarios"</strong>) que decida contratar los servicios ofrecidos.
            </p>
          </div>

          {/* Section 1 */}
          <section id="seccion-1" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 1. APP y Programas
            </h2>
            <div className="space-y-4">
              <p>
                Para efectos de los presentes términos y condiciones, y en general respecto a los servicios prestados por INGRESARIOS, se tendrán en cuenta las siguientes plataformas, aplicaciones, programas y herramientas digitales:
              </p>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <strong>GENY LAB</strong>: Plataforma digital educativa desarrollada por INGRESARIOS, orientada a la educación financiera, hábitos, productividad, mentalidad, psicología del dinero, inversión, desarrollo personal y fortalecimiento de competencias relacionadas con la toma de decisiones financieras.
                </li>
                <li>
                  <strong>Metodologías y Desarrollos Propios</strong>: GENY LAB se encuentra basada en metodologías, modelos, herramientas y desarrollos propios de INGRESARIOS, y podrá incluir contenidos educativos, retos, ejercicios prácticos, evaluaciones, cuestionarios, reportes personalizados, simuladores, herramientas de inteligencia artificial, recursos de acompañamiento digital y demás funcionalidades que INGRESARIOS determine incorporar dentro de la plataforma.
                </li>
                <li>
                  <strong>Actualizaciones</strong>: Las funcionalidades, herramientas, contenidos, ejercicios, retos, evaluaciones, reportes y recursos disponibles dentro de GENY LAB podrán ser actualizados, modificados, ampliados, reemplazados o descontinuados por INGRESARIOS en cualquier momento, como parte de sus procesos de mejora continua, actualización tecnológica y evolución metodológica.
                </li>
                <li>
                  <strong>Licencia de Acceso</strong>: El acceso otorgado al Usuario es personal, limitado, no exclusivo, no transferible y revocable, y en ningún caso implica la adquisición de derechos de propiedad intelectual sobre los contenidos, metodologías, desarrollos tecnológicos, herramientas o recursos que integran la plataforma.
                </li>
              </ul>

              <div className="mt-6 space-y-3 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">1.1 Naturaleza Educativa de GENY LAB</h3>
                <p>
                  El Usuario reconoce y acepta que GENY LAB es una plataforma de carácter exclusivamente educativo, informativo y formativo. Los contenidos, evaluaciones, ejercicios, cuestionarios, reportes personalizados, diagnósticos orientativos, herramientas de inteligencia artificial y demás recursos disponibles dentro de la plataforma tienen como finalidad apoyar procesos de aprendizaje, reflexión, autoconocimiento y desarrollo de hábitos financieros.
                </p>
                <p className="text-xs text-white/50 leading-relaxed font-mono">
                  En consecuencia:<br />
                  i. GENY LAB no presta servicios de asesoría financiera, asesoría de inversión, asesoría tributaria, asesoría jurídica, asesoría psicológica ni asesoría profesional de ninguna naturaleza.<br />
                  ii. Los resultados, perfiles, diagnósticos orientativos, evaluaciones y reportes generados por la plataforma no constituyen diagnósticos clínicos, psicológicos, psiquiátricos o médicos.<br />
                  iii. Los contenidos relacionados con inversión, ahorro, mercados financieros, portafolios, activos financieros o estrategias económicas tienen fines exclusivamente educativos y no constituyen recomendaciones personalizadas de inversión.<br />
                  iv. Toda decisión financiera, económica, patrimonial o de inversión adoptada por el Usuario será de su exclusiva responsabilidad.
                </p>
              </div>

              <div className="mt-4 space-y-3 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">1.2 Programas de Desarrollo Personal y Gestión Emocional</h3>
                <p>
                  GENY LAB podrá incluir retos, ejercicios, evaluaciones, experiencias guiadas y contenidos relacionados con hábitos, emociones, mentalidad, productividad, psicología financiera, desarrollo personal, autoconocimiento, toma de decisiones y gestión emocional. Dichos contenidos tienen una finalidad exclusivamente educativa, reflexiva y formativa, orientada al desarrollo de habilidades personales y financieras dentro del contexto de aprendizaje propuesto por INGRESARIOS.
                </p>
                <p>
                  Los conceptos utilizados dentro de la plataforma, incluyendo referencias a emociones, autosabotaje, creencias limitantes, sombra, miedo, identidad financiera, patrones conductuales o cualquier terminología similar, tienen una finalidad pedagógica y de reflexión personal, y no constituyen diagnósticos clínicos ni evaluaciones psicológicas profesionales.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="seccion-2" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 2. Descripción de los Servicios Prestados
            </h2>
            <div className="space-y-4 font-normal">
              <p>
                <strong>2.1 Descripción general de GENY LAB</strong>: GENY LAB es una plataforma digital de carácter exclusivamente educativo, formativo e informativo, basada en metodologías propias de INGRESARIOS. Su finalidad es facilitar procesos de aprendizaje relacionados con educación financiera, hábitos, mentalidad, productividad, psicología del dinero, desarrollo personal, inversión y toma de decisiones. La plataforma busca proporcionar herramientas de autoconocimiento, reflexión y aprendizaje práctico para que el Usuario fortalezca su criterio personal y financiero de manera autónoma.
              </p>
              <p>
                <strong>2.2 Plataforma en línea y espacios oficiales</strong>: El programa se presta por medio de una plataforma en línea, a través de la cual el Usuario podrá acceder remotamente, desde cualquier lugar con conexión a internet, al contenido, materiales, recursos y demás elementos formativos dispuestos por INGRESARIOS. Como parte del proceso, el Usuario podrá también participar en grupos generales y/o exclusivos los cuales son creados, reconocidos y administrados directamente por INGRESARIOS, por conducto de sus funcionarios, colaboradores o personas designadas. Estos espacios tienen como finalidad facilitar la interacción entre los participantes, la formulación y resolución de inquietudes relacionadas con el aprendizaje, y el intercambio de análisis u operaciones propias, en un contexto exclusivamente pedagógico y de acompañamiento. Incluyendo aplicaciones móviles, asistentes virtuales, herramientas de inteligencia artificial, formularios interactivos, cuestionarios, evaluaciones y reportes personalizados.
              </p>
              <p>
                <strong>2.3 Herramientas y desarrollos propios</strong>: La plataforma GENY LAB podrá incorporar herramientas, desarrollos, metodologías, recursos técnicos y demás activos funcionales de propiedad de INGRESARIOS, los cuales forman parte de su ecosistema formativo y de su propiedad intelectual. INGRESARIOS se reserva el derecho de actualizarlos, ajustarlos, mejorarlos, modificarlos, reemplazarlos o descontinuarlos en cualquier momento, conforme a la experiencia derivada del proceso de aprendizaje, la evolución de sus metodologías y sus procesos internos de mejora continua.
              </p>
              <p>
                <strong>2.4 Herramientas disponibles</strong>: Durante la vigencia del servicio, el Usuario podrá tener acceso a diversas herramientas, funcionalidades, desarrollos tecnológicos, contenidos, recursos metodológicos y sistemas automatizados (en adelante, las “Herramientas”), los cuales son suministrados con fines exclusivamente educativos, informativos y formativos. Las Herramientas podrán incluir, entre otras, evaluaciones, cuestionarios, formularios interactivos, retos guiados, programas de desarrollo de hábitos, ejercicios de autoconocimiento, reportes personalizados, simuladores, calculadoras, herramientas de análisis, asistentes basados en inteligencia artificial, sistemas automatizados de generación de contenido, recursos audiovisuales, actividades prácticas, bitácoras, dinámicas de aprendizaje y demás desarrollos propios del ecosistema de INGRESARIOS.
              </p>
              <p>
                La denominación, cantidad, características, funcionalidades, alcance, disponibilidad y contenido de dichas Herramientas podrá variar, actualizarse, ampliarse, reducirse, reemplazarse o descontinuarse en cualquier momento, sin previo aviso, como parte de los procesos de mejora continua, evolución tecnológica y actualización metodológica de INGRESARIOS. Todas las Herramientas, así como sus actualizaciones, mejoras, derivaciones o versiones futuras, son y seguirán siendo propiedad exclusiva de Reditum Group S.A.S. y se encuentran protegidas por las normas de propiedad intelectual aplicables.
              </p>
              <p>
                INGRESARIOS no garantiza la permanencia de una herramienta, reto, evaluación, reporte, funcionalidad o contenido específico dentro de la plataforma. El Usuario reconoce y acepta que el servicio contratado corresponde al acceso al ecosistema educativo GENY LAB en su versión vigente, y no a una herramienta, reto, evaluación o funcionalidad individual determinada.
              </p>
              <p>
                <strong>2.5 Contenidos digitales</strong>: Como parte de GENY LAB, el Usuario podrá acceder a contenidos digitales, videos, audios, artículos, guías, retos, evaluaciones, ejercicios prácticos, reportes, recursos educativos y demás materiales que INGRESARIOS disponga dentro de la plataforma. Dichos contenidos podrán estar organizados por temas, rutas, retos, niveles, categorías o experiencias de aprendizaje, según la estructura vigente definida por INGRESARIOS. El Usuario reconoce que GENY LAB no necesariamente corresponde a un curso lineal o programa académico estructurado, sino a un ecosistema digital de aprendizaje, autoconocimiento y desarrollo financiero y personal, cuyo contenido podrá ser actualizado, reorganizado, ampliado, reemplazado o descontinuado en cualquier momento conforme a la evolución de la plataforma.
              </p>
              <p>
                <strong>2.6 Dinámicas, retos y actividades</strong>: Como parte de la experiencia de aprendizaje, INGRESARIOS podrá poner a disposición del Usuario dinámicas, actividades y experiencias educativas (en adelante, las “Dinámicas”), tales como ejercicios prácticos, retos guiados, cuestionarios, evaluaciones, bitácoras, simulaciones, programas de hábitos, actividades de reflexión, procesos de autoconocimiento, experiencias de aprendizaje estructuradas y demás recursos diseñados para fortalecer el desarrollo financiero, personal y la toma de decisiones del Usuario. Las Dinámicas podrán abordar, entre otros, temas relacionados con educación financiera, hábitos, productividad, mentalidad, psicología del dinero, inversión, autoconocimiento, gestión emocional, toma de decisiones, disciplina, desarrollo personal y cualquier otra temática que haga parte del ecosistema educativo de GENY LAB.
              </p>
              <p className="bg-white/[0.01] border border-white/5 p-4 rounded-xl text-xs font-mono leading-relaxed text-white/50">
                El Usuario reconoce y acepta que dichas Dinámicas tienen una finalidad exclusivamente educativa, formativa, informativa y de autoevaluación, y que no constituyen asesoría financiera, psicológica, médica, legal, tributaria o profesional de ninguna naturaleza. Asimismo, las Dinámicas no constituyen señales de inversión, recomendaciones personalizadas, promesas de resultados, diagnósticos clínicos, tratamientos psicológicos, procesos terapéuticos ni instrucciones específicas para la toma de decisiones financieras o personales. En consecuencia, cualquier decisión financiera, económica, patrimonial, profesional o personal que el Usuario adopte con ocasión de la información, ejercicios, actividades, reportes o contenidos suministrados por la plataforma será de su exclusiva responsabilidad.
              </p>
              <p>
                INGRESARIOS no realiza operaciones financieras en nombre de los Usuarios, no administra recursos de terceros, no presta servicios de gestión de inversiones, ni dirige la ejecución de decisiones financieras o personales por parte de los Usuarios, limitándose a proporcionar herramientas, metodologías y recursos con fines educativos.
              </p>
              <p>
                INGRESARIOS podrá mostrar dentro de la plataforma, comunidades, grupos o espacios oficiales resultados, avances, estadísticas, reportes, métricas, testimonios, experiencias, ejercicios, bitácoras o desempeños reportados por Usuarios o por el equipo de INGRESARIOS, con fines exclusivamente educativos, informativos e ilustrativos. El Usuario reconoce que dicha información es meramente referencial, puede basarse en información suministrada por terceros, no necesariamente ha sido auditada o verificada de manera independiente por INGRESARIOS y no constituye garantía de resultados, ni indicio de desempeños futuros, ni implica que dichos resultados puedan ser obtenidos o replicados por otros Usuarios.
              </p>
              <p>
                <strong>2.6.1 Evaluaciones, reportes y resultados personalizados</strong>: La plataforma podrá generar perfiles, evaluaciones, reportes personalizados, diagnósticos orientativos, análisis automatizados, recomendaciones educativas y resultados basados en las respuestas, información o interacción suministrada por el Usuario. El Usuario reconoce que dichos resultados tienen una finalidad exclusivamente educativa, informativa y de autoconocimiento. En ningún caso dichos resultados constituyen diagnósticos psicológicos, psiquiátricos, médicos, financieros, legales, tributarios o profesionales, ni sustituyen el criterio propio del Usuario o la asesoría de profesionales competentes. INGRESARIOS no garantiza la exactitud absoluta, utilidad específica o aplicabilidad particular de dichos resultados, los cuales deberán ser interpretados por el Usuario como herramientas de reflexión y aprendizaje.
              </p>
              <p>
                <strong>2.7 Rutas de aprendizaje y segmentación</strong>: GENY LAB podrá presentar contenidos, evaluaciones, ejercicios, reportes, retos, recomendaciones educativas, diagnósticos orientativos o experiencias diferentes según la información suministrada por el Usuario, sus respuestas, nivel de experiencia, objetivos declarados, comportamiento dentro de la plataforma u otros criterios definidos por INGRESARIOS. En consecuencia, los Usuarios podrán ser ubicados en rutas de aprendizaje, segmentos, perfiles, niveles o experiencias distintas, las cuales podrán contener contenidos, actividades, ejercicios, evaluaciones, reportes, herramientas o beneficios diferentes entre sí.
              </p>
              <p>
                El Usuario reconoce que dicha segmentación tiene una finalidad exclusivamente educativa, pedagógica y de personalización de la experiencia dentro de GENY LAB. INGRESARIOS podrá modificar, actualizar o redefinir en cualquier momento los criterios de segmentación, rutas de aprendizaje, perfiles, experiencias, contenidos o herramientas disponibles dentro de la plataforma. La asignación a una determinada ruta, perfil, categoría, nivel o experiencia no constituye una evaluación profesional, certificación, diagnóstico clínico, psicológico, financiero ni garantía de resultados de ninguna naturaleza.
              </p>
              <p>
                <strong>2.8 Acceso digital y vigencia del contenido</strong>: El contenido de GENY LAB es de acceso digital y podrá ser consultado por el Usuario durante la vigencia del plan adquirido, permitiéndole avanzar a su propio ritmo y según su disponibilidad de tiempo. En ningún caso este acceso se entenderá como indefinido, perpetuo o ilimitado, estando sujeto a las condiciones comerciales, técnicas y de duración del servicio contratado. El acceso a GENY LAB, sus contenidos, herramientas, funcionalidades, retos, evaluaciones, reportes, recursos educativos y demás elementos que integran la plataforma estará limitado exclusivamente al periodo de vigencia del plan adquirido, conforme a lo establecido en los presentes términos y condiciones.
              </p>
              <p>
                El Usuario reconoce y acepta que el no uso, uso parcial o interrupción voluntaria del servicio durante dicho periodo no dará lugar, en ningún caso, a la extensión del acceso, reactivación posterior, devolución de dinero, compensación económica ni reconocimiento de tiempo adicional, independientemente de la causa que lo origine. Asimismo, el Usuario reconoce que las funcionalidades, contenidos, retos, herramientas, evaluaciones, reportes y demás recursos disponibles dentro de GENY LAB podrán ser actualizados, modificados, reorganizados, ampliados, reemplazados o descontinuados durante la vigencia del servicio, como parte de los procesos de mejora continua, evolución tecnológica y actualización metodológica de INGRESARIOS, sin que ello constituya incumplimiento del servicio ni genere derecho a compensación alguna. El servicio contratado corresponde al acceso a la plataforma GENY LAB en su versión vigente y no a una herramienta, reto, evaluación, reporte, funcionalidad o contenido específico.
              </p>
              <p>
                De manera excepcional, en casos debidamente justificados por circunstancias de fuerza mayor, el Usuario podrá solicitar la suspensión temporal del acceso a la plataforma mediante solicitud formal presentada a través de los canales oficiales de INGRESARIOS, exponiendo las razones que fundamentan dicha solicitud. INGRESARIOS evaluará cada caso de manera discrecional y, de considerarlo procedente, podrá autorizar una suspensión del servicio por un periodo máximo de hasta seis (6) meses. En ningún caso la suspensión se entenderá como automática ni será efectiva sin la confirmación expresa y escrita por parte de INGRESARIOS.
              </p>
              <p>
                <strong>2.9 Credenciales y activación de funcionalidades</strong>: El acceso a GENY LAB se realizará mediante las credenciales, enlaces, correo electrónico, contraseña, códigos de acceso o mecanismos de autenticación que INGRESARIOS determine según la modalidad técnica vigente de la plataforma. Dichas credenciales serán personales, confidenciales e intransferibles, y solo serán habilitadas una vez INGRESARIOS haya verificado y confirmado el pago efectivo del servicio contratado.
              </p>
              <p>
                El Usuario será responsable por la custodia, confidencialidad y uso adecuado de sus credenciales de acceso, así como por toda actividad realizada desde su cuenta. El Usuario se obliga a no compartir, ceder, prestar, vender o permitir el uso de su cuenta por parte de terceros. El Usuario reconoce que algunas funcionalidades, herramientas, retos, evaluaciones, reportes, contenidos o recursos de GENY LAB podrán requerir activación previa, diligenciamiento de formularios, suministro de información, aceptación de condiciones adicionales, conexión con plataformas de terceros o cumplimiento de requisitos específicos. La no solicitud, activación, diligenciamiento, uso o aprovechamiento de dichas funcionalidades durante la vigencia del plan contratado será responsabilidad exclusiva del Usuario y no dará lugar a extensión del servicio, reactivación posterior, devolución de dinero, compensación económica ni reconocimiento de tiempo adicional.
              </p>
              <p>
                INGRESARIOS podrá suspender o cancelar el acceso del Usuario, sin derecho a reembolso, cuando detecte uso indebido de la cuenta, acceso compartido, intento de suplantación, uso automatizado no autorizado, vulneración de seguridad o cualquier incumplimiento de los presentes términos y condiciones.
              </p>
              <p>
                <strong>2.10 Recursos descargables</strong>: Como parte de GENY LAB, INGRESARIOS podrá poner a disposición del Usuario libros digitales, guías, documentos, audios, videos, plantillas, recursos descargables, materiales de apoyo y demás contenidos educativos en diferentes formatos digitales. La lectura, escucha, estudio, análisis y aprovechamiento de dichos materiales será responsabilidad exclusiva del Usuario como parte de su proceso de aprendizaje. Sin perjuicio de las disposiciones sobre propiedad intelectual previstas en los presentes términos y condiciones, el Usuario podrá descargar aquellos materiales que expresamente sean habilitados para descarga por parte de INGRESARIOS, únicamente en sus dispositivos personales y para su uso individual dentro de la plataforma. La disponibilidad, denominación, formato, cantidad y contenido de estos recursos podrá variar, actualizarse, ampliarse, reemplazarse o descontinuarse en cualquier momento como parte de la evolución de GENY LAB.
              </p>
              <p>
                <strong>2.11 Contenidos audiovisuales e interactivos</strong>: Los contenidos audiovisuales, interactivos y digitales disponibles en GENY LAB podrán presentarse en diferentes formatos, duraciones y estructuras pedagógicas, con el propósito de facilitar su acceso, comprensión y consumo progresivo por parte del Usuario. El acceso, visualización, escucha, estudio y aprovechamiento de dichos contenidos será responsabilidad exclusiva del Usuario. INGRESARIOS no garantiza que el simple acceso o consumo de los contenidos produzca resultados específicos, siendo responsabilidad del Usuario la aplicación práctica de los conocimientos, herramientas y recursos puestos a su disposición dentro de la plataforma.
              </p>
              <p>
                <strong>2.12 Duración del acceso</strong>: El acceso a GENY LAB tendrá la duración correspondiente al plan, membresía o modalidad comercial adquirida por el Usuario al momento de la compra, conforme a las condiciones vigentes informadas por INGRESARIOS. La vigencia del acceso comenzará a contarse a partir de la confirmación efectiva del pago por parte de la plataforma o proveedor de pagos correspondiente.
              </p>
              <p>
                Para los planes con duración determinada, una vez finalizado el periodo contratado, el acceso a la plataforma, sus contenidos, herramientas, funcionalidades, retos, evaluaciones, reportes y demás recursos cesará automáticamente, salvo que el Usuario adquiera una renovación, extensión o nuevo plan de acceso ofrecido por INGRESARIOS. La expiración del periodo contratado no generará derecho a devolución de dinero, compensación económica, reactivación posterior ni reconocimiento de tiempo adicional. Para los planes comercializados como "Acceso Vitalicio", el Usuario recibirá acceso vitalicio a la versión de GENY LAB adquirida al momento de la compra, incluyendo las actualizaciones, mejoras y ajustes que INGRESARIOS realice sobre dicha versión.
              </p>
              <p>
                <strong>2.12.1 Alcance del acceso vitalicio</strong>: El acceso vitalicio no implica el derecho automático a futuras versiones, plataformas, productos, módulos, funcionalidades, ecosistemas tecnológicos o servicios independientes que INGRESARIOS desarrolle, lance o comercialice con posterioridad. INGRESARIOS podrá crear nuevas versiones, ediciones, líneas de producto, planes premium, funcionalidades avanzadas o plataformas independientes, las cuales podrán estar sujetas a condiciones comerciales y tarifas diferentes.
              </p>
              <p>
                Asimismo, el Usuario reconoce que INGRESARIOS podrá actualizar, modificar, reorganizar, reemplazar o descontinuar contenidos, retos, evaluaciones, herramientas o funcionalidades específicas de la versión adquirida, como parte de la evolución tecnológica y metodológica de la plataforma. El acceso vitalicio adquirido corresponde al acceso a la versión contratada de GENY LAB en su estado evolutivo vigente y no constituye una obligación de acceso ilimitado a todos los desarrollos presentes o futuros de INGRESARIOS.
              </p>
              <p>
                <strong>2.13 Activación de herramientas e integraciones</strong>: Durante la vigencia del servicio, el Usuario podrá acceder o solicitar la activación de determinadas herramientas, funcionalidades, evaluaciones, reportes, experiencias, integraciones tecnológicas o recursos adicionales incluidos dentro de GENY LAB, previo cumplimiento de los requisitos establecidos por INGRESARIOS, incluyendo el diligenciamiento de formularios, suministro de información o aceptación de condiciones específicas cuando ello resulte necesario. Algunas funcionalidades podrán requerir el uso de plataformas, aplicaciones, servicios o proveedores tecnológicos de terceros, los cuales son independientes de INGRESARIOS. En consecuencia, el Usuario reconoce que INGRESARIOS no tiene relación societaria, contractual ni de representación con dichos terceros, ni actúa como proveedor, operador o responsable de sus servicios, funcionamiento, disponibilidad o políticas de uso.
              </p>
              <p>
                <strong>2.14 Servicios de terceros</strong>: GENY LAB podrá integrararse, apoyarse o funcionar total o parcialmente mediante plataformas, aplicaciones, servicios tecnológicos, proveedores de inteligencia artificial, servicios de procesamiento de pagos, servicios de mensajería, servicios de almacenamiento, herramientas de análisis de datos, proveedores de infraestructura tecnológica u otros servicios de terceros (en adelante, los “Servicios de Terceros”). Dichos Servicios de Terceros son entidades independientes de INGRESARIOS y cuentan con sus propios términos y condiciones, políticas de privacidad, requisitos de acceso, criterios de aceptación, procesos de validación y condiciones de uso, los cuales son definidos y administrados exclusivamente por dichas entidades.
              </p>
              <p>
                El acceso, registro y utilización de los Servicios de Terceros será responsabilidad exclusiva del Usuario, quien deberá cumplir las condiciones, requisitos y políticas establecidas por cada proveedor cuando ello resulte aplicable. En este sentido, el Usuario reconoce que: i. INGRESARIOS no garantiza el acceso, disponibilidad, continuidad, permanencia o funcionamiento ininterrumpido de los Servicios de Terceros. ii. INGRESARIOS no interviene en los procesos de aprobación, rechazo, suspensión, limitación o cancelación de cuentas, accesos o servicios por parte de terceros. iii. INGRESARIOS no es responsable por decisiones, cambios de políticas, restricciones, interrupciones, errores, fallas técnicas, limitaciones operativas o cualquier otra situación derivada de los Servicios de Terceros. iv. La modificación, suspensión, limitación o terminación de un Servicio de Terceros no constituirá incumplimiento por parte de INGRESARIOS ni dará lugar a reembolso, compensación económica, cancelación del servicio o reclamación alguna por parte del Usuario. v. El Usuario deberá consultar directamente los términos y condiciones, políticas de privacidad y documentación oficial de cada proveedor externo que utilice en relación con GENY LAB.
              </p>
              <p>
                INGRESARIOS podrá reemplazar, modificar o integrar nuevos Servicios de Terceros como parte de la evolución tecnológica de la plataforma, sin que ello implique modificación sustancial de los presentes términos y condiciones. INGRESARIOS no garantiza la disponibilidad permanente de servicios, aplicaciones o integraciones de terceros, ni será responsable por restricciones, modificaciones, interrupciones, errores, fallas técnicas o decisiones adoptadas por dichas entidades. La imposibilidad de utilizar una plataforma, integración o servicio de terceros por causas ajenas a INGRESARIOS no constituirá causal de reembolso, cancelación del servicio ni reclamación alguna por parte del Usuario.
              </p>
              <p>
                <strong>2.15 Herramientas de inteligencia artificial</strong>: Como parte de GENY LAB, INGRESARIOS podrá poner a disposición del Usuario herramientas, asistentes virtuales, sistemas automatizados y funcionalidades basadas en inteligencia artificial (en adelante, las “Herramientas de IA”), desarrolladas, configuradas, entrenadas o adaptadas con metodologías, contenidos y criterios propios de INGRESARIOS, con el fin de apoyar procesos de aprendizaje, educación financiera, desarrollo personal, autoconocimiento, productividad, análisis, generación de contenido y demás finalidades educativas de la plataforma.
              </p>
              <p>
                El Usuario reconoce y acepta que las Herramientas de IA tienen una finalidad exclusivamente educativa, informativa, orientativa y de apoyo, y que en ningún caso constituyen asesoría financiera, asesoría de inversión, asesoría psicológica, asesoría médica, asesoría legal, asesoría tributaria o asesoría profesional de cualquier naturaleza. Las respuestas, recomendaciones educativas, reportes, análisis, sugerencias, resúmenes, perfiles, evaluaciones, diagnósticos orientativos, planes de acción o cualquier otro resultado generado por las Herramientas de IA son producidos mediante procesos automatizados y deberán ser interpretados únicamente como herramientas de apoyo para el aprendizaje y la reflexión personal.
              </p>
              <p>
                INGRESARIOS no garantiza la precisión, exactitud, actualidad, completitud, disponibilidad, idoneidad o aplicabilidad específica de la información generada por las Herramientas de IA. El Usuario reconoce que las Herramientas de IA pueden presentar errores, omisiones, sesgos, interpretaciones inexactas, respuestas incompletas o resultados que no se ajusten a sus circunstancias particulares. En consecuencia, cualquier decisión financiera, económica, patrimonial, profesional, académica, emocional o personal adoptada por el Usuario con base en la información generada por las Herramientas de IA será de su exclusiva responsabilidad. Las Herramientas de IA no sustituyen el criterio propio del Usuario ni reemplazan la consulta con profesionales competentes cuando la naturaleza de la situación así lo requiera. INGRESARIOS podrá actualizar, modificar, reemplazar, entrenar nuevamente, ampliar, limitar o descontinuar las Herramientas de IA en cualquier momento como parte de la evolución tecnológica y metodológica de GENY LAB.
              </p>
              <p>
                <strong>2.15.1 Uso responsable de herramientas de IA</strong>: El Usuario se compromete a utilizar las Herramientas de IA de manera responsable, ética y conforme a la ley, así como a los presentes términos y condiciones. En consecuencia, el Usuario se abstendrá de: i. Utilizar las Herramientas de IA para actividades ilícitas, fraudulentas, engañosas o contrarias al orden público. ii. Utilizar las Herramientas de IA para generar contenido que vulnere derechos de terceros, incluyendo derechos de autor, propiedad intelectual, privacidad o protección de datos personales. iii. Intentar acceder, extraer, copiar, replicar, reconstruir, descompilar, realizar ingeniería inversa o reproducir los modelos, metodologías, configuraciones, instrucciones internas, bases de conocimiento, prompts, lógicas de funcionamiento o cualquier componente interno de las Herramientas de IA. iv. Utilizar la información, respuestas, reportes, análisis o contenidos generados por las Herramientas de IA para desarrollar, entrenar, mejorar o alimentar sistemas de inteligencia artificial propios o de terceros. v. Utilizar medios automatizados, robots, scripts, scraping, extracción masiva de datos o mecanismos similares para acceder o recopilar información de la plataforma. vi. Compartir, comercializar, sublicenciar, revender o explotar comercialmente los resultados generados por las Herramientas de IA como si fueran productos propios. vii. Utilizar las Herramientas de IA de manera que pueda afectar su funcionamiento, seguridad, disponibilidad o integridad.
              </p>
              <p>
                INGRESARIOS podrá suspender, limitar o cancelar el acceso a las Herramientas de IA, sin derecho a reembolso, cuando detecte incumplimientos a las disposiciones aquí establecidas o cualquier uso que considere abusivo, fraudulento o contrario a la finalidad educativa de la plataforma. El Usuario reconoce que las metodologías, configuraciones, instrucciones básicas, bases de conocimiento, desarrollos tecnológicos y demás componentes que soportan las Herramientas de IA forman parte de los activos de propiedad intelectual de INGRESARIOS y se encuentran protegidos por las normas aplicables. Los perfiles, diagnósticos orientativos, evaluaciones, reportes, clasificaciones, resultados, puntuaciones, radiografías financieras, análisis de hábitos, análisis emocionales, recomendaciones educativas o cualquier otro resultado generado por GENY LAB tienen carácter exclusivamente educativo, informativo y orientativo. En consecuencia, no constituyen diagnósticos profesionales, clínicos, psicológicos, psiquiátricos, médicos, financieros, patrimoniales ni de ninguna otra naturaleza, y no deben ser interpretados como una evaluación profesional individualizada.
              </p>
              <p>
                <strong>2.16 Simuladores y Entornos de Práctica</strong>: Como parte de GENY LAB, INGRESARIOS podrá poner a disposición del Usuario simuladores, laboratorios, entornos de práctica, ejercicios interactivos, escenarios educativos o herramientas de entrenamiento relacionadas con diferentes conceptos financieros, económicos o de inversión. Estos simuladores tienen una finalidad exclusivamente educativa, pedagógica y de aprendizaje, permitiendo al Usuario practicar conceptos, estrategias, toma de decisiones y análisis en entornos controlados y con fines académicos.
              </p>
              <p>
                Salvo que se indique expresamente lo contrario, las operaciones realizadas dentro de los simuladores utilizarán capital ficticio, datos simulados, escenarios recreados o información con fines educativos, por lo que no constituyen operaciones reales ni generan ganancias, pérdidas, rendimientos o efectos económicos reales para el Usuario. Los resultados obtenidos dentro de los simuladores no constituyen garantía, indicio ni predicción de resultados futuros en mercados reales, y no deben ser interpretados como evidencia de rentabilidad, desempeño o éxito potencial. La participación en simuladores, laboratorios o entornos de práctica no constituye asesoría financiera, recomendación de inversión, señal de compra o venta, ni invitación a realizar operaciones sobre activos financieros.
              </p>
              <p>
                INGRESARIOS podrá modificar, actualizar, suspender, reemplazar o eliminar cualquier simulador, instrumento financiero disponible, funcionalidad, activo subyacente, mecánica de juego, reglas, métricas, puntuaciones o características de estos entornos de práctica en cualquier momento. El Usuario reconoce que los simuladores son herramientas educativas diseñadas para facilitar el aprendizaje y que su uso se realiza bajo su propia responsabilidad y criterio. La inclusión de instrumentos financieros como opciones, acciones, ETFs, futuros, divisas, criptomonedas u otros activos dentro de los simuladores tiene una finalidad exclusivamente educativa y no constituye recomendación, promoción o incentivo para operar dichos instrumentos en mercados reales.
              </p>
              <p>
                <strong>2.17 Recompensas, beneficios y ofertas comerciales</strong>: Como parte de la experiencia de aprendizaje de GENY LAB, INGRESARIOS podrá habilitar recompensas, beneficios, reconocimientos, contenidos adicionales, herramientas, sesiones, promociones, descuentos, invitaciones, diagnósticos, bonos, ofertas comerciales o cualquier otro incentivo cuando el Usuario complete determinados retos, actividades, evaluaciones, niveles, objetivos o hitos dentro de la plataforma. El desbloqueo de dichos beneficios no constituye un derecho adquirido permanente ni una obligación futura de INGRESARIOS de mantenerlos disponibles de forma indefinida.
              </p>
              <p>
                INGRESARIOS podrá modificar, reemplazar, actualizar, suspender o eliminar cualquier recompensa, beneficio, promoción, bono, incentivo o mecanismo de desbloqueo en cualquier momento, sin que ello genere derecho a compensación, reembolso o reclamación por parte del Usuario. Los beneficios ofrecidos podrán estar sujetos a disponibilidad, cupos limitados, requisitos de elegibilidad, validaciones internas, condiciones comerciales o periodos específicos de utilización. La finalización de retos, evaluaciones, actividades o experiencias dentro de GENY LAB no garantiza la obtención automática de beneficios futuros, descuentos, sesiones personalizadas, programas premium, mentorías, membresías o acceso a otros productos o servicios ofrecidos por INGRESARIOS. Algunas recompensas o beneficios podrán consistir en invitaciones para conocer, evaluar o acceder a productos, servicios, programas, mentorías, membresías, diagnósticos, sesiones de orientación o soluciones adicionales ofrecidas por INGRESARIOS, las cuales estarán sujetas a condiciones comerciales independientes de las aplicables a GENY LAB.
              </p>
              <p>
                <strong>2.18 Sesiones diagnósticas y sesiones de orientación</strong>: INGRESARIOS podrá ofrecer sesiones diagnósticas, sesiones de orientación, auditorías educativas, sesiones de acompañamiento o espacios de interacción individual o grupal como beneficio promocional, recompensa, bono o componente complementario de determinados planes, actividades, retos o experiencias dentro de GENY LAB. Estas sesiones tienen carácter exclusivamente educativo, informativo y orientativo. En ningún caso las sesiones constituyen asesoría financiera, asesoría de inversión, asesoría legal, asesoría tributaria, asesoría psicológica, tratamiento terapéutico, servicios médicos, coaching clínico ni servicios profesionales personalizados de ninguna naturaleza.
              </p>
              <p>
                Las sesiones podrán realizarse de manera virtual, remota o mediante los canales tecnológicos que INGRESARIOS determine para su prestación. La programación de las sesiones estará sujeta a disponibilidad de agenda, cupos, horarios, recursos operativos y demás condiciones establecidas por INGRESARIOS. INGRESARIOS podrá reprogramar, modificar o reemplazar la modalidad, fecha, horario, duración o responsable de la sesión cuando existan razones operativas, técnicas o de disponibilidad. La inasistencia del Usuario, la cancelación tardía, la falta de programación dentro de los plazos establecidos o el incumplimiento de los requisitos definidos por INGRESARIOS podrá generar la pérdida total o parcial del beneficio, sin derecho a compensación, reembolso o reconocimiento económico alguno. Salvo que se indique expresamente lo contrario, las sesiones diagnósticas, de orientación o acompañamiento constituyen beneficios complementarios y no forman parte esencial del acceso contratado a GENY LAB.
              </p>
              <p>
                <strong>2.19 Comunidades, grupos privados y canales de interacción</strong>: Como parte de GENY LAB, INGRESARIOS podrá habilitar comunidades, grupos privados, canales de comunicación, espacios colaborativos o plataformas de mensajería en redes sociales, aplicaciones móviles o servicios de terceros, tales como WhatsApp, Telegram, Facebook, Discord, Slack u otros que se definan en el futuro. Será responsabilidad exclusiva del Usuario contar con las cuentas, dispositivos, acceso a internet y demás requisitos técnicos necesarios para participar en dichos espacios, así como cumplir los términos y condiciones, políticas de privacidad y normas de uso establecidas por cada plataforma o proveedor externo. La disponibilidad, permanencia y funcionamiento de dichos servicios de terceros no dependen de INGRESARIOS, por lo que cualquier restricción, suspensión, limitación o modificación realizada por dichas plataformas no generará responsabilidad para INGRESARIOS ni constituirá causal de reembolso, cancelación o reclamación alguna.
              </p>
              <p>
                <strong>2.20 Comunicaciones operativas</strong>: El Usuario reconoce y acepta que INGRESARIOS podrá comunicarse con él a través de correo electrónico, mensajes de texto, notificaciones dentro de la aplicación, WhatsApp, Telegram u otros medios de comunicación idóneos, con fines relacionados con la activación de la cuenta, soporte, acompañamiento, entrega de contenidos, actualizaciones de la plataforma, comunicaciones operativas, actividades de aprendizaje y demás asuntos relacionados con la prestación del servicio. Asimismo, será responsabilidad exclusiva del Usuario mantener actualizados sus datos de contacto, revisar periódicamente los canales de comunicación habilitados y mantenerse informado sobre las comunicaciones, avisos, contenidos y recursos que INGRESARIOS ponga a su disposición durante la vigencia del servicio.
              </p>
              <p>
                <strong>2.21 Espacios no oficiales y relación entre usuarios</strong>: Los espacios de interacción, comunidades, grupos de estudio, canales de comunicación, iniciativas colaborativas o cualquier otra actividad que surja entre Usuarios por fuera de los canales oficiales administrados directamente por INGRESARIOS corresponden a decisiones autónomas y personales de quienes participen en ellas, y no implican aval, autorización, representación, respaldo ni responsabilidad alguna por parte de INGRESARIOS. En consecuencia, INGRESARIOS no promueve ni autoriza que los Usuarios: i. Cobren a otros Usuarios sumas de dinero por acompañamientos, mentorías, asesorías, capacitaciones, interpretación de resultados, análisis, soporte o cualquier servicio relacionado con GENY LAB, salvo autorización expresa y escrita de INGRESARIOS. ii. Soliciten, reciban, administren o gestionen dinero, activos, inversiones, claves, accesos, credenciales o recursos de otros Usuarios. iii. Entreguen dinero, activos, inversiones, claves, accesos, credenciales o recursos a terceros que afirmen actuar en nombre de INGRESARIOS sin autorización expresa y verificable. iv. Utilicen la marca INGRESARIOS, GENY LAB, GENY o cualquier elemento asociado a la plataforma para promover servicios propios o de terceros sin autorización previa y expresa. v. Presenten como oficiales, afiliadas, autorizadas o vinculadas a INGRESARIOS comunidades, grupos, eventos, servicios, aplicaciones, contenidos o iniciativas creadas por terceros sin aprobación expresa de INGRESARIOS.
              </p>
              <p>
                Cualquier decisión del Usuario de relacionarse con terceros, contratar servicios adicionales, participar en espacios no oficiales, compartir información, entregar recursos o realizar pagos a otros Usuarios será enteramente voluntaria y quedará bajo su exclusiva responsabilidad. En ningún caso dichas actuaciones generarán obligación, respaldo, responsabilidad solidaria, deber de supervisión, reembolso o responsabilidad alguna para INGRESARIOS. INGRESARIOS no certifica, acredita, avala ni reconoce a ningún Usuario como mentor, asesor, coach, representante, embajador o experto autorizado de GENY LAB, salvo comunicación expresa emitida por escrito por la compañía.
              </p>
              <p>
                <strong>2.22 Contacto por parte de INGRESARIOS</strong>: INGRESARIOS, a través de sus funcionarios, colaboradores o personas designadas, podrá contactar al Usuario mediante WhatsApp, Telegram, correo electrónico, notificaciones dentro de la aplicación u otros medios idóneos, con el fin de realizar procesos de activación, bienvenida, soporte, acompañamiento, comunicación operativa, entrega de información, actualización de contenidos e integración a comunidades o espacios oficiales relacionados con GENY LAB.
              </p>
              <p>
                <strong>2.23 Exclusiones: lo que GENY LAB no incluye</strong>: Sin perjuicio de las demás disposiciones de los presentes términos y condiciones, se aclara expresamente que GENY LAB NO es y NO incluye: i. Programa de afiliados, salvo que INGRESARIOS lo cree y comunique expresamente por escrito. ii. Sistema de recompensas por recomendación de terceros, salvo autorización expresa de INGRESARIOS. iii. Clases privadas, mentorías individuales o asesorías personalizadas. iv. Asesoría financiera, de inversión, legal, tributaria, psicológica, médica o profesional de cualquier naturaleza. v. Psicoterapia, tratamiento emocional, diagnóstico clínico, atención en salud mental o acompañamiento terapéutico. vi. Envío de señales, alertas de compra o venta, recomendaciones personalizadas de inversión u operación en vivo. vii. Captación, administración, custodia, manejo, inversión u operación de dinero, activos, cuentas o recursos de terceros. viii. Intermediación financiera, comisionista de bolsa, gestión de portafolios, administración de inversiones o cualquier actividad sometida a autorización, inspección o vigilancia de autoridades financieras. ix. Garantía de resultados económicos, financieros, emocionales, personales, profesionales, patrimoniales o de inversión. x. Acceso indefinido, vitalicio o ilimitado, salvo que así se indique expresamente en la oferta comercial adquirida.
              </p>
              <p>
                Cualquier comentario, ejemplo, opinión, resultado, reporte, respuesta generada por inteligencia artificial, intervención de instructores, colaboradores o Usuarios deberá entenderse como información educativa, ilustrativa y general, y no como parte de un servicio profesional personalizado ni como una obligación adicional asumida por INGRESARIOS.
              </p>
              <p>
                <strong>2.24 Herramientas o funcionalidades adicionales</strong>: La plataforma GENY LAB podrá contemplar herramientas, funcionalidades, contenidos, integraciones, desarrollos, reportes, módulos, retos, experiencias o recursos adicionales que no se encuentren incluidos dentro del plan adquirido por el Usuario. Para acceder a dichos elementos adicionales, el Usuario deberá adquirir el plan, suscripción, membresía, activación o producto correspondiente, según las condiciones comerciales vigentes informadas por INGRESARIOS. El Usuario reconoce y acepta que el valor pagado por GENY LAB solo incluye el acceso a las funcionalidades habilitadas dentro del plan adquirido, y no necesariamente incluye el acceso a todas las herramientas, versiones, retos, reportes, integraciones o desarrollos presentes o futuros de la plataforma.
              </p>
              <p>
                <strong>2.25 Actualizaciones y modificaciones</strong>: INGRESARIOS podrá realizar actualizaciones, ajustes, modificaciones, mejoras, reorganizaciones, ampliaciones, reducciones o cambios en los contenidos, herramientas, funcionalidades, retos, evaluaciones, reportes, módulos, secciones o experiencias disponibles dentro de GENY LAB, con el fin de optimizar la plataforma, mejorar la experiencia del Usuario y mantener la evolución metodológica y tecnológica del servicio. La cantidad, estructura, denominación, disponibilidad y contenido de dichos elementos podrá variar según la versión vigente de GENY LAB, sin que ello constituya incumplimiento del servicio ni genere derecho a reembolso, compensación o reclamación alguna.
              </p>
              <p>
                <strong>2.26 Naturaleza educativa</strong>: Los servicios ofrecidos dentro de GENY LAB tienen un carácter exclusivamente educativo, informativo y formativo. En ningún caso constituyen asesoría financiera, recomendación personalizada de inversión, intermediación en mercados de valores, gestión de recursos de terceros, asesoría legal, tributaria, psicológica, médica, terapéutica o profesional de cualquier naturaleza.
              </p>
              <p>
                <strong>2.27 No garantía de resultados</strong>: GENY LAB no garantiza resultados, rendimientos, rentabilidades, niveles de éxito, cambios de hábitos, mejoras emocionales, transformación personal, reducción de deudas, incremento patrimonial, éxito profesional, éxito empresarial ni resultados específicos de ninguna naturaleza. El Usuario reconoce que cualquier decisión financiera, económica, patrimonial, profesional o personal adoptada con base en la información, herramientas, contenidos, reportes o servicios ofrecidos por INGRESARIOS será de su exclusiva responsabilidad. En consecuencia, INGRESARIOS no será responsable por decisiones, resultados, pérdidas, perjuicios o expectativas no cumplidas derivadas del uso de GENY LAB.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="seccion-3" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 3. Obligaciones y Reglas de Conducta
            </h2>
            <div className="space-y-4">
              <p><strong>3.1 Son obligaciones del Usuario:</strong></p>
              <ul className="list-decimal pl-5 space-y-3">
                <li>Contar y mantener en adecuado estado de funcionamiento los dispositivos tecnológicos necesarios, tales como computador, tableta, teléfono inteligente u otros, que le permitan acceder a GENY LAB, sus contenidos, herramientas, funcionalidades, retos, evaluaciones y recursos digitales.</li>
                <li>Disponer de una conexión a internet estable y suficiente para el acceso y uso adecuado de GENY LAB.</li>
                <li>Gestionar su tiempo de manera adecuada para acceder, desarrollar y aprovechar los contenidos, herramientas, retos, ejercicios, evaluaciones y recursos disponibles en GENY LAB.</li>
                <li>Acceder, visualizar, estudiar, completar y aprovechar, bajo su propia responsabilidad, los contenidos, retos, ejercicios, evaluaciones, reportes y demás recursos disponibles dentro de GENY LAB.</li>
                <li>Participar, de manera voluntaria, en sesiones, comunidades, actividades, charlas, foros, encuentros, retos o espacios que INGRESARIOS pueda habilitar como parte de GENY LAB.</li>
                <li>Respetar las reglas de participación en sesiones, comunidades, foros, grupos, espacios digitales o actividades promovidas por INGRESARIOS.</li>
                <li>Realizar intervenciones, comentarios y aportes en los canales oficiales únicamente en relación con temas propios de GENY LAB y de forma respetuosa, constructiva y pertinente.</li>
                <li>Mantener en todo momento un trato respetuoso, cordial y adecuado hacia el equipo de INGRESARIOS, otros Usuarios y terceros, absteniéndose de utilizar lenguaje ofensivo, discriminatorio, intimidatorio o inapropiado.</li>
                <li>Garantizar la disponibilidad y correcto funcionamiento de sus recursos tecnológicos para acceder a contenidos, herramientas, actividades y comunicaciones de GENY LAB.</li>
                <li>Consultar y atender las indicaciones, comunicaciones, actualizaciones, condiciones y contenidos publicados por INGRESARIOS en sus canales oficiales.</li>
                <li>Realizar, bajo su propia responsabilidad, las actividades, retos, ejercicios, bitácoras, registros, evaluaciones o dinámicas propuestas dentro de GENY LAB.</li>
                <li>Utilizar los canales oficiales de comunicación para resolver dudas, solicitar soporte o reportar inconvenientes relacionados con GENY LAB.</li>
                <li>Participar de manera constructiva, respetuosa y positiva en las actividades grupales, comunidades o espacios colaborativos promovidos por INGRESARIOS.</li>
                <li>Abstenerse de participar en espacios grupales cuando su intervención sea ofensiva, disruptiva, comercial, ajena al propósito educativo o no contribuya al ambiente de aprendizaje.</li>
                <li>Mantener actualizada su información de contacto, incluyendo correo electrónico, número telefónico, usuario en la plataforma y demás datos requeridos para la prestación del servicio.</li>
                <li>Informar oportunamente a INGRESARIOS cualquier situación de fuerza mayor o caso fortuito que pueda afectar de manera relevante su acceso o uso de GENY LAB.</li>
                <li>Respetar y proteger la propiedad intelectual de INGRESARIOS, absteniéndose de reproducir, divulgar, copiar, distribuir, vender, modificar, explotar comercialmente o hacer uso indebido de contenidos, herramientas, metodologías, reportes, prompts, respuestas de inteligencia artificial, diseños, marcas o desarrollos de GENY LAB.</li>
                <li>Actuar con transparencia, buena fe y respeto en sus interacciones con INGRESARIOS, otros Usuarios y cualquier comunidad asociada a GENY LAB.</li>
                <li>Evitar interrupciones indebidas en sesiones, comunidades, foros, grupos o actividades promovidas por INGRESARIOS.</li>
                <li>Contribuir a un ambiente sano, respetuoso, colaborativo y seguro dentro de todos los espacios oficiales administrados por INGRESARIOS.</li>
                <li>Mantener una comunicación asertiva, respetuosa y constructiva con el equipo de INGRESARIOS y demás Usuarios.</li>
                <li>Abstenerse de realizar comentarios, enviar mensajes, publicar contenidos o ejecutar conductas que sean ofensivas, dañinas, intimidatorias, discriminatorias, difamatorias, violentas o que inciten a cualquier tipo de violencia.</li>
                <li>Abstenerse de realizar conductas que afecten el buen nombre, reputación, imagen, seguridad, operación o confianza de INGRESARIOS, GENY LAB, su equipo, sus marcas o demás Usuarios.</li>
                <li>Abstenerse de realizar publicaciones o compartir contenidos ajenos a GENY LAB dentro de los canales oficiales, salvo autorización expresa de INGRESARIOS.</li>
                <li>Abstenerse de promover, comercializar, publicitar o vender productos, servicios, entrenamientos, herramientas, comunidades, asesorías o contenidos propios o de terceros que compitan directa o indirectamente con los ofrecidos por INGRESARIOS, incluyendo el uso de canales oficiales para tales fines.</li>
                <li>Abstenerse de cobrar, ofrecer, promover o comercializar a otros Usuarios servicios de acompañamiento, tutoría, mentoría, asesoría, interpretación de reportes, grupos pagos, análisis, soporte o cualquier otro servicio relacionado con GENY LAB, salvo autorización previa, expresa y escrita de INGRESARIOS.</li>
                <li>Abstenerse de solicitar, recibir, administrar, invertir, operar, custodiar o gestionar dinero, activos, recursos, cuentas, accesos o credenciales de otros Usuarios o terceros dentro de espacios, grupos, comunidades o canales relacionados con INGRESARIOS o GENY LAB.</li>
                <li>Abstenerse de recomendar a otros Usuarios la entrega de dinero, claves, accesos, cuentas, credenciales, activos o recursos a terceros para su administración, operación, inversión, custodia o gestión.</li>
                <li>Reconocer que cualquier relación, acuerdo, negocio, colaboración, apoyo económico, pago, contratación, entrega de dinero o intercambio de información que decida realizar con terceros, incluidos otros Usuarios, será de su exclusiva iniciativa, cuenta y riesgo, y no comprometerá en ningún caso la responsabilidad de INGRESARIOS.</li>
                <li>Abstenerse de presentar como oficiales, afiliadas, autorizadas o vinculadas a INGRESARIOS o GENY LAB grupos, comunidades, espacios de estudio, servicios, actividades, contenidos, reportes, herramientas o iniciativas creadas por Usuarios o terceros sin aprobación expresa y formal de INGRESARIOS.</li>
                <li>Abstenerse de utilizar GENY LAB, sus contenidos, reportes, herramientas o respuestas de inteligencia artificial para crear, entrenar, alimentar, desarrollar o comercializar productos, servicios, plataformas, modelos de inteligencia artificial o metodologías competidoras.</li>
                <li>Abstenerse de realizar scraping, extracción masiva de datos, automatización no autorizada, ingeniería inversa, copia de prompts, extracción de bases de conocimiento o cualquier intento de replicar la lógica interna, metodologías o funcionamiento de GENY LAB.</li>
                <li>Usar GENY LAB de manera responsable, entendiendo que sus contenidos, reportes, retos, evaluaciones y herramientas tienen fines educativos y no sustituyen asesoría profesional financiera, legal, tributaria, psicológica, médica o de inversión.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section id="seccion-4" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 4. Uso de Imagen, Voz, Testimonios y Contenidos Generados
            </h2>
            <div className="space-y-4">
              <p>
                El Usuario autoriza de manera libre, expresa e informada a INGRESARIOS para captar, reproducir, almacenar, comunicar, publicar y utilizar su imagen, voz, nombre, seudónimo, fotografía, video, grabaciones, testimonios, comentarios, opiniones, experiencias, participaciones, resultados, respuestas voluntarias, reseñas y demás contenidos que suministre o genere en el marco de GENY LAB.
              </p>
              <p>
                La presente autorización incluye el uso de dichos contenidos en sesiones virtuales, eventos, comunidades, grupos, redes sociales, plataformas digitales, sitios web, aplicaciones móviles, materiales promocionales, campañas publicitarias, piezas comerciales, contenidos educativos y demás medios físicos o digitales, conocidos o por conocerse. El Usuario autoriza igualmente el uso de testimonios, comentarios, experiencias, valoraciones, reseñas, casos de uso y resultados compartidos voluntariamente dentro de la plataforma o sus canales oficiales, con fines educativos, comerciales, promocionales, publicitarios e institucionales.
              </p>
              <p>
                Cuando INGRESARIOS utilice reportes, resultados, evaluaciones, respuestas o información generada dentro de GENY LAB con fines educativos, estadísticos, investigativos o promocionales, procurará utilizar dicha información de forma agregada, anonimizada o despersonalizada cuando las circunstancias así lo requieran.
              </p>
              <p>
                Esta autorización se otorga sin limitación territorial y durante el tiempo permitido por la legislación aplicable, sin que ello genere derecho a compensación económica, regalía, participación o contraprestación adicional a favor del Usuario. INGRESARIOS se compromete a realizar un uso respetuoso y razonable de la imagen y contenidos del Usuario, absteniéndose de utilizarlos de manera que afecten justificadamente su honra, reputación, intimidad o dignidad.
              </p>
              <p>
                El Usuario podrá solicitar la revocatoria de esta autorización mediante solicitud escrita presentada a través de los canales oficiales de INGRESARIOS. Dicha revocatoria producirá efectos hacia el futuro y no afectará los usos realizados con anterioridad de conformidad con la autorización aquí otorgada. INGRESARIOS no utilizará públicamente respuestas individuales, reportes personalizados, evaluaciones emocionales, ejercicios de autoconocimiento o información sensible de un Usuario con fines promocionales sin su autorización específica para dicho uso.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="seccion-5" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 5. Garantía Legal y de Satisfacción
            </h2>
            <div className="space-y-4">
              <p>
                <strong>5.1 Garantía Legal</strong>: El Usuario contará con un término de garantía legal de quince (15) días calendario, contados a partir del día siguiente a la fecha de compra. Para hacer efectiva la garantía legal, el Usuario deberá presentar una solicitud formal a través de los canales oficiales de atención de INGRESARIOS, indicando los hechos que fundamentan la reclamación y aportando los soportes correspondientes. INGRESARIOS dará respuesta a la solicitud dentro de los términos establecidos por la legislación aplicable.
              </p>
              <p>
                <strong>5.2 Procedencia de la Garantía Legal</strong>: La garantía legal únicamente procederá cuando exista una imposibilidad sustancial, persistente y verificable de acceso o uso de las funcionalidades esenciales de GENY LAB, atribuible directamente a INGRESARIOS. Se entenderá que existe una situación atribuible a INGRESARIOS cuando, de manera injustificada y persistente:<br />
                i. No se habilite el acceso a la plataforma después de haberse confirmado el pago correspondiente.<br />
                ii. Se impida el acceso a las funcionalidades esenciales incluidas dentro del plan adquirido por el Usuario.<br />
                iii. Se produzca una falla generalizada de la plataforma que imposibilite significativamente el uso del servicio durante un periodo razonable.<br />
                Para la evaluación de la solicitud, el Usuario deberá aportar pruebas suficientes, veraces y verificables que permitan evidenciar la situación alegada.
              </p>
              <p>
                <strong>5.3 Exclusiones de la Garantía Legal</strong>: No procederá la garantía legal cuando la imposibilidad de acceso o uso derive de circunstancias ajenas a INGRESARIOS, incluyendo, entre otras:<br />
                i. Problemas de conectividad, equipos, dispositivos o configuraciones del Usuario.<br />
                ii. Incumplimiento de requisitos técnicos mínimos por parte del Usuario.<br />
                iii. Restricciones, bloqueos o limitaciones impuestas por proveedores de internet, fabricantes de dispositivos o terceros.<br />
                iv. Fallas, interrupciones, mantenimientos, actualizaciones o limitaciones de plataformas, aplicaciones, servicios tecnológicos o proveedores externos utilizados por GENY LAB.<br />
                v. Uso inadecuado de la plataforma por parte del Usuario.
              </p>
              <p>
                <strong>5.4 Improcedencia de la Garantía Legal</strong>: En ningún caso procederá la garantía legal por razones subjetivas del Usuario, incluyendo, pero sin limitarse a:<br />
                i. Expectativas no cumplidas.<br />
                ii. Falta de uso o uso parcial de la plataforma.<br />
                iii. Inconformidad con contenidos, retos, evaluaciones, reportes o funcionalidades.<br />
                iv. Resultados financieros, personales, emocionales, profesionales o patrimoniales diferentes a los esperados.<br />
                v. Interpretaciones personales sobre la utilidad de la información suministrada.<br />
                vi. Modificaciones, actualizaciones, reorganizaciones o evolución normal de los contenidos, herramientas o funcionalidades de GENY LAB.
              </p>
              <p>
                <strong>5.5 Garantía de Satisfacción</strong>: De manera voluntaria y como beneficio comercial adicional, INGRESARIOS podrá ofrecer una garantía de satisfacción de siete (7) días calendario contados a partir del fecha de compra. Durante dicho periodo, el Usuario podrá solicitar la devolución del dinero cuando considere que GENY LAB no cumple sus expectativas o no resulta adecuado para sus necesidades.
              </p>
              <p>
                <strong>5.6 Condiciones de la Garantía de Satisfacción</strong>: La solicitud deberá presentarse dentro de los siete (7) días calendario siguientes a la compra a través de los canales oficiales de atención. INGRESARIOS podrá solicitar información razonable que permita validar la compra y la identidad del solicitante. Una vez aprobada la solicitud, se procederá a la devolución conforme a los tiempos, procesos y condiciones de la pasarela de pago o proveedor utilizado.
              </p>
              <p>
                <strong>5.7 Limitaciones de la Garantía de Satisfacción</strong>: La garantía de satisfacción constituye una política comercial voluntaria de INGRESARIOS y es independiente de la garantía legal, del derecho de retracto y de la reversión del pago. INGRESARIOS podrá modificar, suspender o eliminar esta política para futuras compras, sin afectar las solicitudes presentadas dentro de los términos aquí establecidos.
              </p>
              <p>
                <strong>5.8 Plataformas de Pago de Terceros</strong>: Cuando la compra se realice mediante plataformas de terceros o proveedores externos, tales como Hotmart, Stripe, Whop, App Store, Google Play u otros similares, las solicitudes de devolución o reembolso podrán estar sujetas adicionalmente a las políticas, procedimientos y condiciones establecidas por dichos proveedores.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="seccion-6" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 6. Declaración y Aceptación de Riesgos
            </h2>
            <div className="space-y-4">
              <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl space-y-3">
                <p className="font-bold text-white uppercase tracking-wider text-xs font-mono">6.1 INGRESARIOS advierte expresamente a los Usuarios que:</p>
                <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-white/60">
                  <li>El nivel de resultados, avances, desempeño, aprendizaje, transformación personal, desarrollo de hábitos, mejora financiera o cualquier otro resultado que pueda obtenerse mediante el uso de GENY LAB dependerá exclusivamente de las circunstancias, disciplina, compromiso, conocimientos, experiencia, aplicación práctica y criterio individual de cada Usuario. En consecuencia, INGRESARIOS no garantiza, en ningún caso, la obtención de resultados específicos de carácter financiero, económico, patrimonial, personal, profesional, emocional o de cualquier otra naturaleza.</li>
                  <li>Algunos contenidos, herramientas, evaluaciones, reportes, retos o recursos disponibles en GENY LAB podrán abordar temas relacionados con educación financiera, ahorro, inversión, emprendimiento, productividad, hábitos, desarrollo personal o toma de decisiones económicas. El Usuario reconoce que toda decisión financiera, económica, patrimonial o de inversión implica riesgos inherentes y que dichos riesgos dependen de múltiples factores, muchos de los cuales son imprevisibles y ajenos al control de INGRESARIOS.</li>
                  <li>El Usuario reconoce que toda decisión financiera, económica, patrimonial, profesional o personal adoptada con ocasión de la información, contenidos, herramientas, reportes, evaluaciones o recursos suministrados por GENY LAB será de su exclusiva responsabilidad. Antes de tomar decisiones financieras o de inversión, el Usuario deberá evaluar su situación particular, sus objetivos, su tolerancia al riesgo y, si lo considera pertinente, consultar con profesionales independientes competentes.</li>
                  <li>INGRESARIOS no será responsable por pérdidas económicas, afectaciones patrimoniales, decisiones financieras, resultados personales, consecuencias profesionales, reacciones emocionales, expectativas no cumplidas, lucro cesante, pérdida de oportunidad, daños indirectos o cualquier otro perjuicio que el Usuario considere haber sufrido como consecuencia del uso, interpretación o aplicación de los contenidos, herramientas, reportes, evaluaciones, retos, respuestas generadas por inteligencia artificial o cualquier otro recurso suministrado a través de GENY LAB.</li>
                  <li>INGRESARIOS no actúa como entidad financiera, intermediario financiero, comisionista de bolsa, corredor, gestor de inversiones, administrador de portafolios, asesor financiero, asesor de inversión, asesor legal, asesor tributario, profesional de la salud mental, psicólogo, psiquiatra, terapeuta ni prestador de servicios profesionales personalizados de ninguna naturaleza.</li>
                  <li>Los contenidos, herramientas, reportes, evaluaciones, retos, materiales educativos, respuestas generadas por inteligencia artificial, comunicaciones, ejemplos, simulaciones, publicaciones, contenidos promocionales y demás recursos suministrados por INGRESARIOS tienen carácter exclusivamente educativo, informativo, formativo e ilustrativo. En consecuencia, no constituyen ni deben interpretarse como asesoría financiera, asesoría de inversión, asesoría legal, asesoría tributaria, asesoría psicológica, asesoría médica, recomendación personalizada, diagnóstico profesional, promesa de resultados ni instrucción específica para la toma de decisiones. El Usuario declara que comprende y acepta que todas las decisiones financieras, económicas, patrimoniales, profesionales o personales que adopte serán tomadas bajo su propio criterio, cuenta y responsabilidad.</li>
                  <li>El Usuario reconoce que GENY LAB puede utilizar, integrarse o apoyarse en plataformas, aplicaciones, herramientas tecnológicas, servicios de inteligencia artificial, servicios de mensajería, pasarelas de pago, proveedores de infraestructura tecnológica y demás servicios prestados por terceros independientes. INGRESARIOS no mantiene necesariamente relaciones societarias, de representación o control sobre dichos terceros, ni garantiza la disponibilidad, continuidad, permanencia o funcionamiento ininterrumpido de sus servicios. Asimismo, INGRESARIOS no será responsable por restricciones, interrupciones, modificaciones, cambios de políticas, limitaciones técnicas, suspensiones o cualquier situación derivada de servicios prestados por terceros ajenos a su control. El Usuario reconoce que cualquier relación, registro, contratación, aceptación de términos, suministro de información o uso de servicios de terceros se realiza bajo su propia responsabilidad y conforme a las condiciones establecidas por cada proveedor. La utilización, limitación, modificación o descontinuación de servicios de terceros no constituirá incumplimiento por parte de INGRESARIOS ni dará lugar a reembolsos, indemnizaciones o compensaciones, salvo disposición legal expresa en contrario.</li>
                  <li>El Usuario reconoce que el uso de la plataforma GENY LAB puede involucrar contenidos, ejercicios, retos, evaluaciones, reportes y herramientas relacionados con educación financiera, hábitos, mentalidad, productividad, autoconocimiento, toma de decisiones, gestión emocional e inversión. El Usuario acepta que dichos contenidos pueden invitar a la reflexión sobre su situación financiera, creencias, emociones, hábitos, patrones de comportamiento y decisiones personales, lo cual puede generar incomodidad, cuestionamientos o presión emocional. En este sentido, el Usuario declara que participa de manera voluntaria y bajo su propia responsabilidad, y que se encuentra en condiciones personales, emocionales y mentales adecuadas para utilizar la plataforma. Si el Usuario considera que algún contenido, ejercicio, reto o evaluación puede afectar su bienestar emocional o mental, deberá abstenerse de realizarlo y consultar previamente con un profesional competente.</li>
                  <li>Los contenidos, herramientas, evaluaciones, reportes, retos, ejercicios, materiales educativos, recursos metodológicos, funcionalidades basadas en inteligencia artificial, comunicaciones, simulaciones, ejemplos, análisis, respuestas automatizadas, sesiones en vivo o grabadas, interacciones en comunidades y demás recursos disponibles en GENY LAB tienen una finalidad exclusivamente educativa, formativa, informativa y de aprendizaje. En consecuencia, en ningún caso podrán entenderse o interpretarse como:
                    <ul className="list-alpha pl-5 mt-1.5 space-y-1">
                      <li>a. Asesoría financiera, de inversión, legal, tributaria, contable, psicológica, médica o profesional de cualquier naturaleza.</li>
                      <li>b. Recomendaciones personalizadas para la toma de decisiones financieras, patrimoniales, profesionales o personales.</li>
                      <li>c. Diagnósticos clínicos, psicológicos, psiquiátricos o médicos.</li>
                      <li>d. Promesas, garantías o certificaciones de resultados.</li>
                      <li>e. Administración, gestión, custodia, recepción o manejo de dinero, activos o recursos de terceros.</li>
                      <li>f. Intermediación financiera, gestión de inversiones, administración de portafolios o cualquier actividad sometida a autorización, inspección o vigilancia de autoridades competentes.</li>
                    </ul>
                  </li>
                  <li>El Usuario reconoce y acepta expresamente que INGRESARIOS no evalúa ni determina la conveniencia, idoneidad o adecuación de decisiones financieras, económicas, patrimoniales, profesionales o personales para su caso particular, no realiza perfilamiento individual, no emite recomendaciones personalizadas y no garantiza que la información suministrada sea apropiada para sus necesidades, objetivos, expectativas o circunstancias específicas. Toda decisión adoptada por el Usuario con ocasión de la información, contenidos, herramientas, reportes o recursos suministrados por GENY LAB será tomada de manera autónoma, unilateral y bajo su exclusiva responsabilidad.</li>
                  <li>El Usuario declara que comprende y acepta que toda decisión financiera, económica, patrimonial, profesional o personal implica riesgos e incertidumbres inherentes, incluyendo la posibilidad de obtener resultados distintos a los esperados. Asimismo, reconoce que el uso de herramientas de inteligencia artificial, evaluaciones, reportes, retos y recursos de autoconocimiento puede generar interpretaciones subjetivas y que corresponde exclusivamente al Usuario evaluar la pertinencia de la información recibida para su situación particular.</li>
                  <li>INGRESARIOS no garantiza resultados, utilidades, rendimientos, retornos, cambios de hábitos, transformación personal, mejora financiera, incremento patrimonial, éxito profesional, éxito empresarial, bienestar emocional, cumplimiento de objetivos ni resultados específicos de ninguna naturaleza. Cualquier referencia a ejemplos, simulaciones, casos hipotéticos, testimonios, experiencias de terceros, resultados previos, estadísticas, reportes, análisis históricos o escenarios proyectados tendrá carácter exclusivamente ilustrativo, educativo, académico o comercial y no constituirá garantía, promesa o indicio de resultados futuros.</li>
                  <li>El Usuario reconoce que los resultados obtenidos dentro de simuladores, laboratorios, entornos de práctica, ejercicios interactivos o experiencias educativas ofrecidas por GENY LAB no constituyen garantía, indicio, evidencia ni predicción de resultados futuros en mercados reales, y no deben ser utilizados como base exclusiva para la toma de decisiones financieras o de inversión.</li>
                  <li>El Usuario reconoce que cualquier interpretación que realice de los contenidos, herramientas, evaluaciones, reportes, respuestas generadas por inteligencia artificial, metodologías o recursos suministrados por INGRESARIOS será efectuada bajo su propio criterio, cuenta y riesgo. En consecuencia, salvo disposición legal expresa en contrario, INGRESARIOS no será responsable por pérdidas económicas, afectaciones patrimoniales, lucro cesante, pérdida de oportunidad, daños indirectos, consecuencias emocionales o cualquier otro perjuicio que el Usuario alegue haber sufrido como consecuencia del uso, aplicación o interpretación de los recursos disponibles en GENY LAB.</li>
                  <li>INGRESARIOS recomienda que aquellas personas que consideren que pueden verse afectadas emocionalmente por ejercicios de autoconocimiento, reflexión personal, gestión emocional, análisis de hábitos, creencias o patrones de comportamiento, consulten previamente con un profesional competente antes de participar en determinadas actividades de GENY LAB. El Usuario asume la responsabilidad sobre su participación en la plataforma y sobre las decisiones que adopte con ocasión de los contenidos, ejercicios, evaluaciones, reportes, retos y herramientas disponibles. En ningún caso INGRESARIOS será responsable por interpretaciones subjetivas, reacciones emocionales, expectativas personales no cumplidas o decisiones adoptadas por el Usuario como consecuencia de su participación en GENY LAB. El Usuario manifiesta de forma libre, expresa e informada que ha leído, comprendido y aceptado íntegramente la presente advertencia y que podrá acudir a profesionales independientes cuando considere necesario obtener asesoría especializada. El Usuario renuncia expresamente a formular reclamaciones basadas exclusivamente en expectativas subjetivas, interpretaciones personales de los contenidos o resultados que no hayan sido expresamente garantizados por INGRESARIOS.</li>
                </ul>
              </div>

              <div className="mt-4 space-y-3 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">6.2 Advertencia sobre Bienestar Emocional y Salud Mental</h3>
                <p>
                  El Usuario reconoce que algunos ejercicios, cuestionarios, evaluaciones, reportes, retos, contenidos, herramientas de inteligencia artificial o actividades de GENY LAB pueden invitar a la reflexión sobre experiencias personales, emociones, creencias, hábitos, decisiones, patrones de comportamiento, relación con el dinero, productividad, identidad financiera o autoconocimiento.
                </p>
                <p className="text-xs text-white/50 leading-relaxed font-mono">
                  En consecuencia:<br />
                  i. GENY LAB no presta servicios de psicología, psiquiatría, psicoterapia, coaching terapéutico, tratamiento emocional, atención en salud mental ni acompañamiento clínico.<br />
                  ii. Los resultados, perfiles, reportes, diagnósticos orientativos, evaluaciones o respuestas generadas por la plataforma no constituyen diagnósticos clínicos, psicológicos, psiquiátricos, médicos ni terapéuticos.<br />
                  ii.1. Los perfiles, diagnósticos orientativos, evaluaciones, reportes, clasificaciones, resultados, puntuaciones, radiografías financieras, análisis de hábitos, análisis emocionales o cualquier otro resultado generado por GENY LAB tienen carácter exclusivamente educativo y orientativo.<br />
                  iii. Los contenidos, ejercicios y herramientas de GENY LAB no sustituyen procesos terapéuticos, tratamientos médicos ni la atención de profesionales de la salud.<br />
                  iv. Si el Usuario presenta antecedentes de trastornos psicológicos, emocionales o psiquiátricos, o considera que alguna actividad puede afectar su bienestar emocional o mental, deberá abstenerse de realizarla y consultar previamente con un profesional competente.<br />
                  v. El Usuario participa voluntariamente en las actividades de GENY LAB y asume la responsabilidad sobre la forma en que interpreta, aplica o procesa los contenidos, reportes, ejercicios y resultados generados.<br />
                  vi. INGRESARIOS no será responsable por de la forma en que interpreta o aplica o procesa los contenidos, reportes, ejercicios y resultados generados. vi. INGRESARIOS no será responsable por interpretaciones subjetivas, reacciones emocionales, decisiones personales, expectativas no cumplidas o cualquier afectación que el Usuario atribuya a su participación en los ejercicios, retos, evaluaciones o actividades de la plataforma.<br />
                  vii. Lo anterior aplica igualmente a cualquier reporte, evaluación, diagnóstico orientativo, reto, experiencia de aprendizaje, contenido generado por inteligencia artificial o herramienta futura incorporada a GENY LAB.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="seccion-7" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 7. Pago de Servicios
            </h2>
            <div className="space-y-4 font-normal">
              <p>
                <strong>7.1 Proveedores</strong>: INGRESARIOS podrá ofrecer a los Usuarios diferentes medios de pago para la adquisición de GENY LAB y demás productos o servicios, incluyendo plataformas de terceros especializadas en procesamiento de pagos, pasarelas de pago, tiendas de aplicaciones, entidades financieras, procesadores de pago o cualquier otro proveedor autorizado (en adelante, los “Proveedores de Servicios de Pago”).
              </p>
              <p>
                <strong>7.2 Responsabilidad</strong>: Sin perjuicio de los derechos que le asisten al Usuario conforme a la legislación aplicable, INGRESARIOS no será responsable por la no autorización de transacciones, rechazos de pago, bloqueos, validaciones, inconsistencias en la información suministrada, errores en el proceso de cobro, limitaciones operativas o cualquier otra situación atribuible al Proveedor de Servicios de Pago, a entidades financieras o a terceros involucrados en la transacción. En consecuencia, será responsabilidad exclusiva del Usuario verificar que la transacción haya sido realizada correctamente y que el pago haya sido procesado de forma exitosa. INGRESARIOS no almacena ni tiene acceso directo a datos financieros sensibles del Usuario, tales como números completos de tarjetas, claves, códigos de seguridad o credenciales bancarias.
              </p>
              <p>
                <strong>7.3 Seguridad</strong>: Los pagos realizados mediante medios electrónicos podrán estar sujetos a mecanismos de seguridad implementados por los Proveedores de Servicios de Pago. No obstante, el Usuario reconoce que las transacciones digitales implican riesgos inherentes asociados a internet, sistemas informáticos y servicios de terceros. En consecuencia, INGRESARIOS no será responsable por incidentes de seguridad, fallas, interrupciones, vulneraciones, ataques informáticos o eventos que no sean directamente atribuibles a una actuación dolosa o gravemente culposa de INGRESARIOS.
              </p>
              <p>
                <strong>7.4 Procesamiento</strong>: Para efectos operativos, administrativos, comerciales o de procesamiento de pagos nacionales e internacionales, INGRESARIOS podrá utilizar sociedades vinculadas, filiales, mandatarios, aliados estratégicos o entidades autorizadas para la recepción y gestión de cobros. En particular, algunos pagos podrán ser procesados a través de Reditum Group LLC o de cualquier otra entidad vinculada o autorizada por INGRESARIOS para dichos fines. El Usuario reconoce y acepta que la utilización de estas entidades para la gestión de cobros no modifica la naturaleza del servicio contratado, ni implica la existencia de una relación contractual diferente a la aquí regulada. La prestación de los servicios, contenidos, herramientas y funcionalidades de GENY LAB continuará siendo responsabilidad de INGRESARIOS, independientemente de la entidad utilizada para la recepción o procesamiento de los pagos.
              </p>
              <p>
                <strong>7.5 Condiciones</strong>: El Usuario reconoce y acepta que el uso de los medios de pago disponibles estará sujeto a los términos, condiciones, políticas, validaciones y procedimientos establecidos por cada Proveedor de Servicios de Pago.
              </p>
              <p>
                <strong>7.6 Cuentas Autorizadas</strong>: INGRESARIOS podrá disponer de cuentas bancarias, billeteras digitales, productos financieros, tiendas de aplicaciones, sistemas de suscripción recurrente o cualquier otro mecanismo autorizado para la recepción de pagos. Las transacciones realizadas mediante dichos mecanismos estarán sugeridas a las condiciones, tiempos de procesamiento, verificaciones, políticas antifraude y procedimientos establecidos por las entidades correspondientes. INGRESARIOS no será responsable por demoras, rechazos, devoluciones, bloqueos, errores de transferencia o cualquier inconveniente derivado del funcionamiento de dichas entidades o de información incorrecta suministrada por el Usuario.
              </p>
              <p>
                <strong>7.7 Suscripción Recurrente</strong>: Cuando GENY LAB o cualquier otro servicio de INGRESARIOS opere bajo un modelo de suscripción recurrente, el Usuario autoriza los cobros periódicos correspondientes conforme a las condiciones informadas al momento de la contratación. Será responsabilidad exclusiva del Usuario cancelar, modificar o gestionar su suscripción a través de los mecanismos habilitados para tal fin antes de la fecha de renovación correspondiente.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">a. Planes de Pago</h4>
                  <p className="text-xs text-white/50">
                    <strong>7.8</strong> INGRESARIOS podrá ofrecer diferentes modalidades de pago para el acceso a GENY LAB, incluyendo pagos únicos, pagos a cuotas, suscripciones recurrentes, membresías, planes anuales, planes vitalicios u otras modalidades comerciales.<br />
                    <strong>7.9</strong> Cuando el Usuario adquiera un plan mediante pago único, deberá realizar el pago completo del valor informado. Una vez confirmado, se habilitará el acceso.
                  </p>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">b. Pagos a Cuotas</h4>
                  <p className="text-xs text-white/50">
                    <strong>7.10</strong> Se compromete a pagar la totalidad conforme al número de cuotas y montos informados.<br />
                    <strong>7.11</strong> Autoriza el cobro automático periódico.<br />
                    <strong>7.12</strong> Debe actualizar método de pago ante fallas.<br />
                    <strong>7.13</strong> Pagos vencidos resultarán en la suspensión temporal de acceso sin extinguir la deuda.<br />
                    <strong>7.15</strong> Completado el pago total, cesarán cobros.
                  </p>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">c. Terminación</h4>
                  <p className="text-xs text-white/50">
                    <strong>7.16</strong> INGRESARIOS podrá suspender o terminar el acceso por incumplimientos de conducta, mal uso de herramientas, o violaciones de propiedad intelectual.<br />
                    <strong>7.17</strong> La suspensión puede ser temporal o definitiva.<br />
                    <strong>7.18</strong> Terminación por causa atribuible al usuario no generará derecho a reembolso o indemnización.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sections 8 to 15 summarized with full text block in readable columns */}
          <section id="seccion-8" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 8. Fuerza Mayor y Disponibilidad Tecnológica
            </h2>
            <div className="space-y-4">
              <p>
                <strong>8.1 Exclusión de Responsabilidad</strong>: INGRESARIOS no será responsable por la suspensión, interrupción, degradación, limitación o imposibilidad de prestar total o parcialmente los servicios de GENY LAB cuando dicha situación obedezca a eventos de fuerza mayor, caso fortuito o circunstancias ajenas a su control razonable, incluyendo: fallas de internet o electricidad, ciberataques, fallas en centros de datos, actos de autoridades gubernamentales, o fallas en servicios de mensajería o pasarelas de pago de terceros.
              </p>
              <p>
                <strong>8.2 Dependencia Tecnológica</strong>: El Usuario reconoce que el acceso y funcionamiento de GENY LAB depende de infraestructura tecnológica, redes de comunicación, dispositivos y pasarelas de pago. En consecuencia, INGRESARIOS no garantiza la disponibilidad continua o ininterrumpida de la plataforma, ni será responsable por fallas técnicas, errores de software, o caídas de servidores.
              </p>
              <p>
                <strong>8.3 Mantenimiento</strong>: INGRESARIOS podrá realizar mantenimientos, actualizaciones o intervenciones programadas o de emergencia, las cuales podrán generar interrupciones temporales sin derecho a compensación.
              </p>
            </div>
          </section>

          <section id="seccion-9" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 9. Canales de Atención y Comunicación
            </h2>
            <div className="space-y-4">
              <p><strong>9.1 Canales de Atención Oficiales:</strong></p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Usuarios Generales / Soporte Preventa: <a href="mailto:holaingresarios@ingresarios.com" className="text-brand-blue hover:underline">holaingresarios@ingresarios.com</a></li>
                <li>Usuarios Registrados / Soporte Alumnos: <a href="mailto:alumnos@ingresarios.com" className="text-brand-blue hover:underline">alumnos@ingresarios.com</a></li>
                <li>Asuntos Administrativos e Institucionales: <a href="mailto:administrativa@ingresarios.com" className="text-brand-blue hover:underline">administrativa@ingresarios.com</a></li>
                <li>WhatsApp oficial de soporte: <strong className="text-white">573205169070</strong></li>
              </ul>
              <p>
                <strong>9.2 - 9.6 Comunicaciones y Cancelaciones</strong>: Autoriza el envío de notificaciones operativas y comerciales por correo, SMS, o WhatsApp. El usuario podrá cancelar suscripciones a correos comerciales escribiendo a <a href="mailto:administrativa@reditum.com" className="text-brand-blue hover:underline">administrativa@reditum.com</a>, no obstante, seguirá recibiendo correos obligatorios de acceso y seguridad.
              </p>
            </div>
          </section>

          <section id="seccion-10" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 10. Derecho de Retracto
            </h2>
            <div className="space-y-4">
              <p>
                De conformidad con lo dispuesto en la <strong>Ley 1480 de 2011 (Estatuto del Consumidor en Colombia)</strong>, el Usuario podrá ejercer el derecho de retracto respecto de la compra de GENY LAB, siempre que se cumpla:<br />
                i. Que se haya adquirido mediante comercio electrónico, internet o canales no presenciales.<br />
                ii. Que se ejerza dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la fecha de adquisición del servicio.<br />
                iii. Que el Usuario <strong>no haya accedido, iniciado sesión, utilizado, descargado ni consumido</strong> ningún contenido o recurso digital en GENY LAB.<br />
                Si se cumplen las condiciones, se devolverá el dinero. En caso contrario, por haberse iniciado la ejecución del servicio digital contratado al momento de ingresar a la app, el derecho de retracto no será procedente.
              </p>
            </div>
          </section>

          <section id="seccion-11" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 11. Reversión de Pago
            </h2>
            <div className="space-y-4">
              <p>
                <strong>11.1 - 11.9 Reversión de Pago</strong>: De conformidad con el Decreto 587 de 2016, el Usuario podrá solicitar la reversión del pago cuando la adquisición se realice vía canales electrónicos y se cumplan causales legales (servicio no solicitado, no recibido, no corresponde a lo solicitado, o fraude). Deberá presentarse ante el emisor de tarjeta y ante INGRESARIOS en un plazo máximo legal de 5 días hábiles desde que tuvo conocimiento de la falla. No procederá por causas subjetivas (falta de uso, expectativas no cumplidas, inconformidad de respuestas de IA).
              </p>
            </div>
          </section>

          <section id="seccion-12" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 12. Propiedad Intelectual
            </h2>
            <div className="space-y-4">
              <p>
                <strong>12.1 Titularidad</strong>: Todos los derechos de propiedad intelectual e industrial relacionados con GENY LAB (códigos, metodologías, reportes, simuladores, marcas, logotipos, asistentes de IA, prompts) son propiedad exclusiva de <strong>Reditum Group S.A.S.</strong> e <strong>INGRESARIOS</strong>.
              </p>
              <p>
                <strong>12.2 Prohibiciones</strong>: Queda prohibido copiar, reproducir, revender, sublicenciar, extraer información de manera automatizada (scraping), realizar ingeniería inversa o utilizar los contenidos para entrenar modelos de IA competidores, bajo pena de suspensión inmediata de la cuenta y acciones legales correspondientes.
              </p>
            </div>
          </section>

          <section id="seccion-13" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 13. Ley Aplicable y Aceptación de los Términos
            </h2>
            <div className="space-y-4">
              <p>
                <strong>13.1 Ley Aplicable</strong>: Los presentes Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la <strong>República de Colombia</strong>.
              </p>
              <p>
                <strong>13.3 Aceptación Electrónica</strong>: La aceptación mediante casillas de verificación (checkbox) o botones de confirmación digital tiene plena validez jurídica, equivalente a firma manuscrita.
              </p>
              <p>
                <strong>13.7 Modificaciones</strong>: INGRESARIOS podrá actualizar o complementar los términos cuando sea necesario. Las modificaciones entran en vigencia a partir de su publicación en la web o envío por correo.
              </p>
            </div>
          </section>

          <section id="seccion-14" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 14. Aceptación Total de los Términos
            </h2>
            <div className="space-y-4">
              <p>
                <strong>14.1 - 14.6 Capacidad y Aceptación</strong>: El Usuario declara contar con capacidad legal para contratar. Manifiesta haber leído y comprendido los términos en su totalidad, aceptándolos de forma libre e informada al registrarse, activar su cuenta o realizar transacciones.
              </p>
            </div>
          </section>

          <section id="seccion-15" className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-brand-blue uppercase flex items-center gap-2">
              <FileText className="w-5 h-5" /> 15. Advertencia Final
            </h2>
            <div className="space-y-4">
              <p>
                <strong>15.1</strong> En caso de no estar de acuerdo total o parcialmente, absténgase de utilizar la aplicación o registrarse.<br />
                <strong>15.4</strong> Comprende la naturaleza formativa e informativa de la plataforma, y acepta sus exclusiones de responsabilidad.<br />
                <strong>15.5</strong> La utilización de la app implica la aceptación plena de estos términos en su versión vigente.
              </p>
              <p className="text-xs text-white/40 font-mono tracking-wide pt-4">
                Fecha de entrada en vigencia: 27 de mayo de 2026.
              </p>
            </div>
          </section>

        </article>

      </main>

      <Footer />
    </div>
  );
}
