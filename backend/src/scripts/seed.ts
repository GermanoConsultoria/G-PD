import "dotenv/config";
import { supabase } from "../db/supabase";
import { seedDatabase } from "../db/seedData";

seedDatabase(supabase)
  .then(() => {
    console.log("Seed concluído.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
