export interface TeamMember {
  name: string;
  role: string;
  image?: string; // placeholder until real photos from Nico
}

export const team: TeamMember[] = [
  { name: "Franco Russo", role: "Director" },
  { name: "Equipo Ventas", role: "Asesores comerciales" },
  { name: "Equipo Alquileres", role: "Gestión de alquileres" },
  { name: "Administración", role: "Soporte y gestión" },
];
