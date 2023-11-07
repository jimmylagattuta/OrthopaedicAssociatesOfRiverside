class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    csrf_token = form_authenticity_token
    search_term = 'orthopedic'
    reviews = YelpCached.cached_yelp_reviews(search_term)

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
    def self.remove_user_by_name(users, name)
      users.reject! { |user| user['user']['name'] == name }
    end

    def self.cached_yelp_reviews(search_term)
      redis = Redis.new(url: ENV['REDIS_URL'])
      cached_data = redis.get("cached_yelp_reviews_#{search_term}")
      reviews = JSON.parse(cached_data) if cached_data

      if cached_data.present?
        # Parse the JSON data into an array of hashes
        users = JSON.parse(cached_data)

        # Call the class method to remove the user with name "Pdub .."
        remove_user_by_name(users, 'Pdub ..')

        # Convert the updated data back to a JSON string
        updated_reviews = JSON.generate(users)

        return updated_reviews
      end

      http = Net::HTTP.new("api.yelp.com", 443)
      http.use_ssl = true

      encoded_search_term = URI.encode_www_form_component(search_term)
      url = URI("https://api.yelp.com/v3/businesses/search?term=#{encoded_search_term}")
      request = Net::HTTP::Get.new(url)
      request["Accept"] = 'application/json'
      request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}" # Print the Yelp API key for debugging
      request["limit"] = "10" # You can adjust the limit as needed

      puts "Yelp API Request Headers:"
      puts request.inspect

      response = http.request(request)
      body = response.read_body
      parsed_response = JSON.parse(body)

      puts "Yelp API Response for search term '#{search_term}':"
      puts parsed_response.inspect

      if parsed_response["error"]
        puts "Error: #{parsed_response['error']['description']}"
        return { reviews: [] }
      end

      # Extract and return the list of businesses from the search results
      businesses = parsed_response["businesses"]
      redis.set("cached_yelp_reviews_#{search_term}", JSON.generate(businesses))
      redis.expire("cached_yelp_reviews_#{search_term}", 30.days.to_i)

      return businesses
    rescue StandardError => e
      puts "Error in call_yelp: #{e.message}"
      return { "error": e.message }
    end
  end
end
