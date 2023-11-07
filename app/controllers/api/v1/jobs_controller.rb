class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    csrf_token = form_authenticity_token
    alias_names = ['orthopedic-associates-of', 'orthopaedic-associates-of']
    aliases = YelpCached.cached_yelp_aliases(alias_names)

    render json: { aliases: aliases, csrf_token: csrf_token }
  rescue StandardError => e
    puts "Error in search_yelp_for_orthopedic: #{e.message}"
    render json: { "error": e.message }
  end

  require 'redis'
  require 'json'
  require 'uri'
  require 'net/http'

  class YelpCached
    def self.cached_yelp_aliases(alias_names)
      redis = Redis.new(url: ENV['REDIS_URL'])
      cached_data = redis.get("cached_yelp_aliases_#{alias_names.join('-')}")
      aliases = JSON.parse(cached_data) if cached_data

      if cached_data.present?
        return aliases
      end

      http = Net::HTTP.new("api.yelp.com", 443)
      http.use_ssl = true

      aliases = []

      alias_names.each do |alias_name|
        url = URI("https://api.yelp.com/v3/businesses/search?location=Chicago&location=Riverside&location=La Grange&alias=#{alias_name}")
        request = Net::HTTP::Get.new(url)
        request["Accept"] = 'application/json'
        request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"

        response = http.request(request)
        body = response.read_body
        parsed_response = JSON.parse(body)

        puts "Yelp API Response for alias '#{alias_name}':"
        puts parsed_response.inspect

        if parsed_response["error"]
          puts "Error: #{parsed_response['error']['description']}"
          next
        end

        aliases << alias_name
      end

      # Store the retrieved data in the cache
      redis.set("cached_yelp_aliases_#{alias_names.join('-')}", JSON.generate(aliases))
      redis.expire("cached_yelp_aliases_#{alias_names.join('-')}", 30.days.to_i)

      return aliases
    rescue StandardError => e
      puts "Error in call_yelp: #{e.message}"
      return { "error": e.message }
    end
  end
end
