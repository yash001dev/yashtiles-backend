import mongoose from 'mongoose';
import { MaterialSchema } from './material/material.schema';
import { FrameSchema } from './frame/frame.schema';
import { SizeSchema } from './size/size.schema';
import { HangTypeSchema } from './hang-type/hang-type.schema';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photoframix';

const Material = mongoose.model('Material', MaterialSchema);
const Frame = mongoose.model('Frame', FrameSchema);
const Size = mongoose.model('Size', SizeSchema);
const HangType = mongoose.model('HangType', HangTypeSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Materials
  await Material.deleteMany({});
  await Material.insertMany([
    { name: 'Classic Frame', description: 'Traditional frame with mounting', enabled: true },
    { name: 'Frameless', description: 'Clean, modern look', enabled: true },
    { name: 'Canvas', description: 'Textured canvas finish', enabled: true },
  ]);

  // Frames (Frame Colors)
  await Frame.deleteMany({});
  await Frame.insertMany([
    { name: 'Black', description: 'Classic black finish', enabled: true },
    { name: 'White', description: 'Clean white finish', enabled: true },
    { name: 'Brown', description: 'Warm brown finish', enabled: true },
  ]);

  // Sizes
  await Size.deleteMany({});
  await Size.insertMany([
    { size: '8x8', price: 299, enabled: true },
    { size: '8x10', price: 404, enabled: true },
    { size: '10x8', price: 404, enabled: true },
    { size: '9x12', price: 582, enabled: true },
    { size: '12x9', price: 582, enabled: true },
    { size: '12x12', price: 797, enabled: true },
    { size: '12x18', price: 1218, enabled: true },
    { size: '18x12', price: 1218, enabled: true },
    { size: '18x18', price: 1900, enabled: true },
    { size: '18x24', price: 2400, enabled: true },
    { size: '24x18', price: 2400, enabled: true },
    { size: '24x32', price: 4200, enabled: true },
    { size: '32x24', price: 4200, enabled: true },
    { size: '8x11', price: 0, enabled: true },
    { size: '11x8', price: 0, enabled: true },
  ]);

  // Hang Types
  await HangType.deleteMany({});
  await HangType.insertMany([
    { name: 'Stickable Tape', description: 'Our unique offering. A stackable tape that you just have to peel off the backing and stick on your wall, it just works!', enabled: true },
    { name: 'Standard Hook', description: 'A classic trusted option for those looking for a solid solution. Hang them on nails with ease with our hook type frames.', enabled: true },
  ]);

  console.log('Initial config seeded!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
}); 