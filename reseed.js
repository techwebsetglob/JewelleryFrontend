import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './src/firebase.js';
import { seedProducts } from './src/utils/seedProducts.js';

const run = async () => {
    console.log("Clearing all existing products...");
    const snapshot = await getDocs(collection(db, 'products'));
    for (const d of snapshot.docs) {
        await deleteDoc(doc(db, 'products', d.id));
    }
    console.log(`Deleted ${snapshot.size} products.`);

    console.log("Seeding new detailed products...");
    const res = await seedProducts();
    console.log("Seed result:", res);
    process.exit(0);
};

run().catch(console.error);
