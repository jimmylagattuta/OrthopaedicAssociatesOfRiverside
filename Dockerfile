# Use the official Ruby image as a base image
FROM ruby:3.2.2

# Install Node.js, Yarn, and npm
RUN apt-get update -qq && apt-get install -y nodejs npm

# Set the working directory in the container
WORKDIR /app

# Create necessary directories with correct permissions
RUN mkdir -p /opt/ruby && chmod -R 777 /opt/ruby

# Copy the Gemfile and Gemfile.lock into the container
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install

# Copy the Rails application code into the container
COPY . /app/

# Set up the React client
WORKDIR /app/client
RUN npm install
RUN npm run build
# Move the React build files into the desired location within the Rails app directory
WORKDIR /app/public
RUN cp -R /app/client/build/. .

# Move back to the Rails app directory
WORKDIR /app

# Expose port 3000 to the Docker host, so it can be accessed from the outside
# Expose port 80 to the Docker host
EXPOSE 80

# Start the Rails application on port 80
CMD ["rails", "server", "-b", "0.0.0.0", "-p", "80"]
