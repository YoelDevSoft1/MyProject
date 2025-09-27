// Chakra imports
import { Icon } from "@chakra-ui/react";
import { IoMdHome } from "react-icons/io";
import { MdBarChart, MdPerson, MdFileCopy, MdCalendarToday, MdAttachMoney, MdPsychology, MdNotifications, MdAdminPanelSettings } from "react-icons/md";
import { FaUser } from "react-icons/fa";

// Custom components
import DataTables from "views/admin/dataTables";
import Profile from "views/admin/profile";
import Appointments from "views/medical/appointments/AppointmentsOptimized"; // CORS fixed - using optimized version
import MedicalRecords from "views/medical/records";
import Patients from "views/medical/patients";
import Payments from "views/medical/payments";
import AIMedical from "views/medical/ai";
import Notifications from "views/medical/notifications";
import AdminPanel from "views/medical/admin";

// Auth components
import SignIn from "views/auth/signIn";
import SignUp from "views/auth/signUp";
import ForgotPassword from "views/auth/forgotPassword";

// Intelligent Redirect component
import IntelligentRedirect from "components/IntelligentRedirect";

// Contextual Dashboard component
import ContextualDashboard from "components/ContextualDashboard";

const routes = [
  {
    name: "Dashboard SMD VITAL",
    layout: "/admin",
    path: "/dashboard",
    icon: <Icon as={IoMdHome} width="20px" height="20px" color="inherit" />,
    component: ContextualDashboard,
  },
  {
    name: "Citas Médicas",
    layout: "/admin",
    path: "/appointments",
    icon: <Icon as={MdCalendarToday} width="20px" height="20px" color="inherit" />,
    component: Appointments,
  },
  {
    name: "Expedientes",
    layout: "/admin",
    path: "/medical-records",
    icon: <Icon as={MdFileCopy} width="20px" height="20px" color="inherit" />,
    component: MedicalRecords,
  },
  {
    name: "Pacientes",
    layout: "/admin",
    path: "/patients",
    icon: <Icon as={FaUser} width="20px" height="20px" color="inherit" />,
    component: Patients,
  },
  {
    name: "Pagos",
    layout: "/admin",
    path: "/payments",
    icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />,
    component: Payments,
  },
  {
    name: "IA Médica",
    layout: "/admin",
    path: "/ai",
    icon: <Icon as={MdPsychology} width="20px" height="20px" color="inherit" />,
    component: AIMedical,
  },
  {
    name: "Notificaciones",
    layout: "/admin",
    path: "/notifications",
    icon: <Icon as={MdNotifications} width="20px" height="20px" color="inherit" />,
    component: Notifications,
  },
  {
    name: "Administración",
    layout: "/admin",
    path: "/administration",
    icon: <Icon as={MdAdminPanelSettings} width="20px" height="20px" color="inherit" />,
    component: AdminPanel,
  },
  {
    name: "Tablas de Datos SMD VITAL",
    layout: "/admin",
    path: "/data-tables",
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: DataTables,
  },
  {
    name: "Perfil SMD VITAL",
    layout: "/admin",
    path: "/profile",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Profile,
  },
  // Auth Routes
  {
    name: "Iniciar Sesión",
    layout: "/auth",
    path: "/sign-in",
    component: SignIn,
  },
  {
    name: "Crear Cuenta",
    layout: "/auth",
    path: "/sign-up",
    component: SignUp,
  },
  {
    name: "Recuperar Contraseña",
    layout: "/auth",
    path: "/forgot-password",
    component: ForgotPassword,
  },
  // Intelligent Redirect Route
  {
    name: "Redirección Inteligente",
    layout: "",
    path: "/intelligent-redirect",
    component: IntelligentRedirect,
  },
];

export default routes;