import { View, Text, FlatList} from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SearchInput from '../../components/SearchInput';
import VideoCard from '../../components/VideoCard';
import EmptyState from '../../components/EmptyState';
import { searchPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import { useLocalSearchParams } from 'expo-router';

const Search = () => {

  const { query } = useLocalSearchParams()
  const { data: posts, refetch } = useAppwrite( () => 
    searchPosts(query)
  );

  useEffect(() => {
    refetch()

  }, [query])

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator.username}
            avatar={item.creator.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-100">
              Search result
            </Text>
            <Text className="text-2xl font-psemibold text-white">
              {query}
            </Text>
            <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No Videos Found for this search !"
          />
        )}
      />
    </SafeAreaView>
  )
}

export default Search