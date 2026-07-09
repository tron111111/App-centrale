// supabase-client.js
// Module commun de connexion Supabase pour toutes les apps du portail Laforêt Pithiviers.
// Ce fichier ne fait qu'initialiser la connexion : il n'est pas encore utilisé
// pour remplacer localStorage. On teste juste que ça communique.

// Charge le SDK Supabase depuis leur CDN officiel (pas besoin d'installer quoi que ce soit).
// À inclure AVANT ce script dans le HTML :
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://tclqiusyonocedobtoky.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbHFpdXN5b25vY2Vkb2J0b2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NzgzNjksImV4cCI6MjA5OTE1NDM2OX0.XVi1FBXk-RjdFslOuikXYWvc1CSrWmTareDDTgzQxxM';

// Crée un client unique, réutilisable dans toutes les pages qui incluent ce fichier.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
