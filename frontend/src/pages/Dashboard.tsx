import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePacientes } from '../hooks/usePacientes';
import { useTurnos } from '../hooks/useTurnos';

const FRASES_INSPIRACIONALES = [
  "Fuerte no es el que nunca se quiebra, fuerte es el que se quiebra, llora, se arma y sigue eligiendo vivir...",
  "Lo que niegas te somete, lo que aceptas te transforma. - Carl Jung",
  "El curioso caso de que cuando me acepto a mí mismo, es cuando puedo cambiar. - Carl Rogers",
  "No somos lo que nos ha pasado, somos lo que decidimos ser. - Carl Jung",
  "No puedes detener las olas, pero puedes aprender a surfear. - Jon Kabat-Zinn",
  "La herida es el lugar por donde la luz entra en ti. - Rumi",
  "Conocer tu propia oscuridad es el mejor método para lidiar con la oscuridad de los demás. - Carl Jung",
  "Incluso la noche más oscura terminará y el sol saldrá. - Victor Hugo",
  "Quien mira afuera, sueña; quien mira adentro, despierta. - Carl Jung",
  "Hasta que lo inconsciente no se haga consciente, el subconsciente dirigirá tu vida y tú le llamarás destino. - Carl Jung",
  "La buena vida es un proceso, no un estado del ser. Es una dirección, no un destino. - Carl Rogers",
  "En todo ser humano hay una tendencia natural hacia la actualización y el crecimiento. - Carl Rogers",
  "Un fracaso no es siempre un error, puede ser simplemente lo mejor que se puede hacer en esas circunstancias. - B.F. Skinner",
  "La vulnerabilidad no es ganar o perder; es tener el valor de aparecer y ser visto cuando no tenemos control. - Brené Brown",
  "El zapato que le ajusta a un hombre le aprieta a otro; no hay receta para la vida que funcione en todos los casos. - Carl Jung",
  "No hay árbol que sus ramas alcancen el cielo, si sus raíces no llegan al infierno. - Carl Jung",
  "Soltar no es decir adiós, es decir gracias y seguir adelante.",
  "Tu visión se aclarará solamente cuando puedas mirar en tu propio corazón. - Carl Jung",
  "Lo más aterrador es aceptarse a uno mismo por completo. - Carl Jung",
  "No estoy en esta vida para cumplir las expectativas de otras personas, ni siento que el mundo deba cumplir las mías. - Fritz Perls",
  "La resiliencia es la capacidad del ser humano para hacer frente a las adversidades y salir fortalecido de ellas. - Boris Cyrulnik",
  "Aquel que tiene un 'porqué' para vivir, puede soportar casi cualquier 'cómo'. - Viktor Frankl",
  "Entre el estímulo y la respuesta hay un espacio. En ese espacio está nuestro poder de elegir nuestra respuesta. - Viktor Frankl",
  "Cuando ya no somos capaces de cambiar una situación, nos encontramos ante el desafío de cambiarnos a nosotros mismos. - Viktor Frankl",
  "Todo puede serle arrebatado a un hombre, menos la última de las libertades humanas: elegir su actitud. - Viktor Frankl",
  "A veces el acto de valentía más grande es simplemente pedir ayuda.",
  "Sanar no significa que el daño nunca existió, significa que el daño ya no controla nuestras vidas.",
  "Si no te gusta algo, cámbialo. Si no puedes cambiarlo, cambia tu actitud. - Maya Angelou",
  "La vida es un 10% lo que te sucede y un 90% cómo reaccionas a ello. - Charles R. Swindoll",
  "Nadie se ilumina imaginando figuras de luz, sino por hacer consciente la oscuridad. - Carl Jung",
  "El gran descubrimiento de mi generación es que podemos alterar nuestras vidas alterando nuestras actitudes mentales. - William James",
  "Toda persona tiene la capacidad de cambiar si se le proporciona el clima psicológico adecuado. - Carl Rogers",
  "El autoconocimiento no es una garantía de felicidad, pero está del lado de la felicidad. - Karen Horney",
  "Donde hay amor hay vida, y donde hay dolor, hay sanación.",
  "Las emociones inexpresadas nunca mueren. Son enterradas vivas y salen más tarde de peores formas. - Sigmund Freud",
  "El privilegio de tu vida es convertirse en quien realmente eres. - Carl Jung",
  "No hay deber que descuidemos tanto como el deber de ser felices. - Robert Louis Stevenson"
];

const FECHA_HOY = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

export const Dashboard = () => {
  const [fraseDelDia, setFraseDelDia] = useState(FRASES_INSPIRACIONALES[0]);
  const { pacientes } = usePacientes();
  const { turnos } = useTurnos();

  useEffect(() => {
    const fraseAleatoria = FRASES_INSPIRACIONALES[Math.floor(Math.random() * FRASES_INSPIRACIONALES.length)];
    setFraseDelDia(fraseAleatoria);
  }, []);

  const ahora = new Date();
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const finHoy = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000);

  const turnosHoy = turnos.filter((t: any) => {
    const inicio = new Date(t.fechaHoraInicio);
    return t.estado !== 'CANCELADO' && inicio >= inicioHoy && inicio < finHoy;
  });

  const proximoTurno = turnos
    .filter((t: any) => t.estado !== 'CANCELADO' && new Date(t.fechaHoraInicio) > ahora)
    .sort((a: any, b: any) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime())[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Hero editorial */}
      <div className="bg-warm-900 rounded-2xl p-9 md:p-11 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }}
        />
        <div className="flex-1 space-y-5 relative">
          <p className="eyebrow text-warm-400 capitalize">{FECHA_HOY}</p>
          <h1 className="font-serif italic text-2xl md:text-3xl text-warm-50 leading-[1.35] min-h-[90px]">
            "{fraseDelDia}"
          </h1>
          <Link to="/turnos" className="btn-secondary bg-warm-50 border-transparent hover:bg-white">
            Ver Agenda Completa <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div
          className="w-40 h-40 md:w-48 md:h-48 shrink-0 relative rounded-full ring-4 ring-warm-800"
          style={{
            WebkitMaskImage: 'radial-gradient(circle closest-side, rgba(0,0,0,1) 96%, rgba(0,0,0,0) 100%)',
            maskImage: 'radial-gradient(circle closest-side, rgba(0,0,0,1) 96%, rgba(0,0,0,0) 100%)',
          }}
        >
          <img src="/images/profesional.jpg" alt="Foto de perfil" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Franja "de un vistazo": números editoriales, sin el cliché de icono-en-círculo */}
      <div className="surface p-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-warm-100">
          <div className="p-6">
            <p className="eyebrow">Pacientes</p>
            <p className="font-serif text-4xl text-warm-900 mt-2">{pacientes.length}</p>
          </div>
          <div className="p-6">
            <p className="eyebrow">Turnos de hoy</p>
            <p className="font-serif text-4xl text-brand-700 mt-2">{turnosHoy.length}</p>
          </div>
          <div className="p-6">
            <p className="eyebrow">Próximo turno</p>
            {proximoTurno ? (
              <div className="mt-2">
                <p className="font-serif text-2xl text-warm-900 leading-none">
                  {new Date(proximoTurno.fechaHoraInicio).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} hs
                </p>
                <p className="text-sm text-warm-500 mt-1.5">{proximoTurno.paciente?.nombre} {proximoTurno.paciente?.apellido}</p>
              </div>
            ) : (
              <p className="font-serif text-2xl text-warm-300 mt-2">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
