class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    reviews = YelpCached.cached_yelp_reviews

    render json: reviews
  rescue StandardError => e
    puts "Error in pull_yelp_cache: #{e.message}"
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

    def self.cached_yelp_reviews
      redis = Redis.new(url: ENV['REDIS_URL'])
      cached_data = redis.get('cached_yelp_reviews')
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

      businesses = [
        { alias: "orthopedic-associates-of-riverside-riverside" }
      ]
      http = Net::HTTP.new("api.yelp.com", 443)
      http.use_ssl = true
      reviews = []
      businesses.each do |business|
        business_url = URI("https://api.yelp.com/v3/businesses/#{business[:alias]}")
        business_request = Net::HTTP::Get.new(business_url)
        business_request["Accept"] = 'application/json'
        business_request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
        business_response = http.request(business_request)
        business_body = business_response.read_body
        business_parsed_response = JSON.parse(business_body)
        next if business_parsed_response["error"]
        url = URI("https://api.yelp.com/v3/businesses/#{business[:alias]}/reviews")
        request = Net::HTTP::Get.new(url)
        request["Accept"] = 'application/json'
        request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
        request["limit"] = "3"
        response = http.request(request)
        body = response.read_body
        parsed_response = JSON.parse(body)
        if parsed_response["error"]
          puts "Error: #{parsed_response['error']['description']}"
          next
        end
        parsed_reviews = parsed_response["reviews"]
        next if parsed_reviews.empty?
        parsed_reviews.each do |review|
          review["text"] = review["text"].strip # Remove leading/trailing spaces
        end
        limited_reviews = parsed_reviews.take(3)
        limited_reviews.each do |review|
          if review["rating"] == 5 && !reviews.any? { |r| r["id"] == review["id"] }
            reviews << review
          end
        end
      end

      redis.set("cached_yelp_reviews", JSON.generate(reviews))
      redis.expire("cached_yelp_reviews", 30.days.to_i)
      cached_reviews = redis.get("cached_yelp_reviews")
      reviews = JSON.parse(cached_reviews) if cached_reviews

      if cached_reviews.present?
        # Parse the JSON data into an array of hashes
        users = JSON.parse(cached_reviews)

        # Call the class method to remove the user with name "Pdub .."
        remove_user_by_name(users, 'Pdub ..')

        # Convert the updated data back to a JSON string
        updated_reviews = JSON.generate(users)

        return updated_reviews
      end

      return { reviews: "No cached reviews" }
    rescue StandardError => e
      puts "Error in call_yelp: #{e.message}"
      return { "error": e.message }
    end
  end
end
