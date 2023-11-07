class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    csrf_token = form_authenticity_token
    aliases = [
      'orthopedic-associates-of-riverside-riverside'
    ]
    reviews = YelpCached.cached_yelp_reviews(aliases)

    render json: { reviews: reviews, csrf_token: csrf_token }
  rescue StandardError => e
    puts "Error in search_yelp_for_orthopedic: #{e.message}"
    render json: { "error": e.message }
  end

  require 'redis'
  require 'json'
  require 'uri'
  require 'net/http'

  class YelpCached
    def self.cached_yelp_reviews(alias_name)
      redis = Redis.new(url: ENV['REDIS_URL'])
      cached_data = redis.get("cached_yelp_reviews_#{alias_name}")
      reviews = JSON.parse(cached_data) if cached_data
    
      if cached_data.present?
        # Parse the JSON data into a hash
        data = JSON.parse(cached_data)
    
        # Call the class method to remove the user with name "Pdub .."
        remove_user_by_name(data['reviews'], 'Pdub ..')
    
        # Convert the updated data back to a JSON string
        updated_reviews = JSON.generate(data)
    
        return updated_reviews
      end
    
      http = Net::HTTP.new("api.yelp.com", 443)
      http.use_ssl = true
    
      url = URI("https://api.yelp.com/v3/businesses/#{alias_name}/reviews")
      request = Net::HTTP::Get.new(url)
      request["Accept"] = 'application/json'
      request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
    
      response = http.request(request)
      body = response.read_body
      parsed_response = JSON.parse(body)
    
      puts "Yelp API Response for alias '#{alias_name}' reviews:"
      puts parsed_response.inspect
    
      if parsed_response["error"]
        puts "Error: #{parsed_response['error']['description']}"
        return { reviews: [] }
      end
    
      # Store the retrieved data in the cache
      redis.set("cached_yelp_reviews_#{alias_name}", JSON.generate(parsed_response))
      redis.expire("cached_yelp_reviews_#{alias_name}", 30.days.to_i)
    
      return parsed_response
    rescue StandardError => e
      puts "Error in call_yelp: #{e.message}"
      return { "error": e.message }
    end
     
  end
end
