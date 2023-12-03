# Use the official Ruby image as a base image
FROM ruby:3.2.2

# Install Node.js, Yarn, and npm
RUN apt-get update -qq && apt-get install -y nodejs npm

# Set the working directory in the container
WORKDIR /orthopaedicasssociatesofriverside

# Copy the Gemfile and Gemfile.lock into the container
COPY Gemfile Gemfile.lock /orthopaedicasssociatesofriverside/

# Install gems
RUN bundle install

# Copy the Rails application code into the container
COPY . /orthopaedicasssociatesofriverside/

# Set up the React client
WORKDIR /orthopaedicasssociatesofriverside/client
RUN npm install
RUN npm run build

# Move the React build files into the desired location within the Rails app directory
WORKDIR /orthopaedicasssociatesofriverside
# RUN mkdir -p /orthopaedicasssociatesofriverside/app/public
RUN npm run deploy

# RUN cp -R /orthopaedicasssociatesofriverside/client/build/* /orthopaedicasssociatesofriverside/app/public/

# Expose port 3000 to the Docker host, so it can be accessed from the outside
EXPOSE 3000

# Start the Rails application
CMD ["rails", "s", "-b", "0.0.0.0"]
