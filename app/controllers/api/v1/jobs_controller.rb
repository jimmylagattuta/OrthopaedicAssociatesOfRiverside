class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    csrf_token = form_authenticity_token
    business_alias = 'orthopedic-associates-of-riverside-chicago' # Specify the business alias here
    reviews = YelpCached.cached_yelp_reviews(business_alias)

    render json: { reviews: reviews, csrf_token: csrf_token }
  rescue StandardError => e
    puts "Error in search_yelp_for_orthopedic: #{e.message}"
    render json: { "error": e.message }
  end

  require 'redis'
  require 'json'
  require 'net/http'

  class YelpCached
    def self.remove_user_by_name(users, name)
      users.reject! { |user| user['user']['name'] == name }
    end

    def self.cached_yelp_reviews(business_alias)
      redis = Redis.new(url: ENV['REDIS_URL'])
      cached_data = redis.get("cached_yelp_reviews_#{business_alias}")
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

      url = URI("https://api.yelp.com/v3/businesses/#{business_alias}")
      request = Net::HTTP::Get.new(url)
      request["Accept"] = 'application/json'
      request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"

      response = http.request(request)
      body = response.read_body
      parsed_response = JSON.parse(body)

      puts "Yelp API Response for business alias '#{business_alias}':"
      puts parsed_response.inspect

      if parsed_response["error"]
        puts "Error: #{parsed_response['error']['description']}"
        return { reviews: [] }
      end

      # Retrieve reviews for the specified business alias
      url = URI("https://api.yelp.com/v3/businesses/#{business_alias}/reviews")
      request = Net::HTTP::Get.new(url)
      request["Accept"] = 'application/json'
      request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
      request["limit"] = "10" # You can adjust the limit as needed

      response = http.request(request)
      body = response.read_body
      parsed_reviews_response = JSON.parse(body)

      puts "Yelp API Response for reviews of business alias '#{business_alias}':"
      puts parsed_reviews_response.inspect

      if parsed_reviews_response["error"]
        puts "Error: #{parsed_reviews_response['error']['description']}"
        return { reviews: [] }
      end

      parsed_reviews = parsed_reviews_response["reviews"]

      redis.set("cached_yelp_reviews_#{business_alias}", JSON.generate(parsed_reviews))
      redis.expire("cached_yelp_reviews_#{business_alias}", 30.days.to_i)

      return parsed_reviews
    rescue StandardError => e
      puts "Error in call_yelp: #{e.message}"
      return { "error": e.message }
    end
  end
end
