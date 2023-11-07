class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    csrf_token = form_authenticity_token
    alias_name = 'orthopedic-associates-of-riverside-riverside' # Set the desired alias here
    puts 1
    reviews, cache_cleared = YelpCached.cached_yelp_reviews(alias_name, 8) # Limit the reviews to 8
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
    
      http = Net::HTTP.new("api.yelp.com", 443)
      http.use_ssl = true
      puts 10
    
      url = URI("https://api.yelp.com/v3/businesses/#{alias_name}/reviews?limit=#{review_limit}") # Add review_limit to the URL
      request = Net::HTTP::Get.new(url)
      request["Accept"] = 'application/json'
      request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
      puts 11
    
      response = http.request(request)
      body = response.read_body
      parsed_response = JSON.parse(body)
      puts 12
    
      puts "Yelp API Response for alias '#{alias_name}' reviews:" # This is puts 13
      puts parsed_response.inspect
    
      if parsed_response["error"]
        puts "Error: #{parsed_response['error']['description']}" # This is puts 14
        return [parsed_response, cache_cleared]
      end
    
      # Store the retrieved data in the cache
      redis.set("cached_yelp_reviews", JSON.generate(parsed_response))
      redis.expire("cached_yelp_reviews", 30.days.to_i)
    
      # Limit the reviews to the specified number
      parsed_response['reviews'] = parsed_response['reviews'].take(review_limit)
      puts 13
    
      return [parsed_response, cache_cleared]
    rescue StandardError => e
      puts "Error in call_yelp: #{e.message}" # This is puts 15
      return [{ "error": e.message }, cache_cleared]
    end
  end
end
