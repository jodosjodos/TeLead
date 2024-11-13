# Step 1: Use a lightweight Node.js image
FROM node:18-alpine

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json (or yarn.lock) into the container
COPY package*.json ./

# Step 4: Install the project dependencies
RUN npm cache clean --force && npm install

# Step 5: Copy the rest of the project files into the container
COPY . .

# Step 6: Generate the Prisma client (based on your schema)
RUN npx prisma generate

# Step 7: Build the NestJS application
RUN npm run build

# Step 8: Expose the application's port (match the port from your `main.ts`)
EXPOSE 3000

# Step 9: Define the command to run the application
CMD ["npm", "run", "start:migrate:prod"]
