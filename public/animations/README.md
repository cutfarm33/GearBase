# Animation Setup Guide

## Export from After Effects

1. Install the **Bodymovin** plugin in After Effects
2. Select your composition
3. Go to Window > Extensions > Bodymovin
4. Click the settings icon and select your composition
5. Choose the output path to this directory
6. Click "Render"
7. Name your file something like `interface-demo.json`

## Integration Steps

Once you have your JSON file:

1. Place the exported JSON file in this directory (`public/animations/`)
2. Open `screens/WebsiteScreen.tsx`
3. Find the commented-out Lottie code (around line 152)
4. Uncomment the Lottie component
5. Add this import at the top of the file:
   ```tsx
   import animationData from '/animations/your-animation-filename.json';
   ```
6. Remove the placeholder div

Your animation will now play in the rounded container below the feature grid!
