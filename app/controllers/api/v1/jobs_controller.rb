class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    csrf_token = form_authenticity_token
    alias_name = 'orthopedic-associates-of-riverside-riverside' # Set the desired alias here
    puts 1
    reviews, cache_cleared = YelpCached.cached_yelp_reviews(alias_name, "8") # Limit the reviews to 8
    puts 2
    render json: { reviews: reviews, csrf_token: csrf_token, cache_cleared: cache_cleared }
  rescue StandardError => e
    puts 3
    puts "Error in search_yelp_for_orthopedic: #{e.message}" # This is puts 3
    render json: { "error": e.message }
  end

  require 'redis'
  require 'json'
  require 'uri'
  require 'net/http'

  class YelpCached
    def self.remove_user_by_name(users, name)
      users.reject! { |user| user['user']['name'] == name }
    end

    def self.cached_yelp_reviews(alias_name, review_limit)
      redis = Redis.new(url: ENV['REDIS_URL'])
      cached_data = redis.get("cached_yelp_reviews")
      reviews = JSON.parse(cached_data) if cached_data
      cache_cleared = false
      puts 4
    
      if cached_data.present?
        # Parse the JSON data into a hash
        data = JSON.parse(cached_data)
        puts "data"
        puts data.inspect
        puts 5
    
        # Call the class method to remove the user with name "Pdub .."
        remove_user_by_name(data['reviews'], 'Pdub ..')
        puts 6
    
        # Limit the reviews to the specified number
        data['reviews'] = data['reviews'].take(review_limit)
        puts 7
    
        # Convert the updated data back to a JSON string
        updated_reviews = JSON.generate(data)
        puts 8
    
        # Clear the cache variable
        redis.del("cached_yelp_reviews")
        cache_cleared = true
        puts 9
    
        return [updated_reviews, cache_cleared] # Return both reviews and cache_cleared as an array
      end
    
      # Rest of your code...
    
      # If you didn't clear the cache, you can return false for cache_cleared
      return [parsed_response, cache_cleared]
    end
    
  end
end
