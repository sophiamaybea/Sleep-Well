import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TakeoverScreen from '../components/TakeoverScreen';
import Card from '../components/Card';

const PublicCollectionPage: React.FC = () => {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/collections/public/${username}/${slug}`);
        const data = await response.json();
        setCollection(data);
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [username, slug]);

  if (loading) return <div>Loading...</div>;

  if (!collection) return <div>Collection not found.</div>;

  const { title, description, author, poems, price } = collection;

  return (
    <div>
      {collection.takeover && <TakeoverScreen />}
      <h1>{title}</h1>
      <p>{description}</p>
      <p>by {author}</p>
      <div>
        {poems.map((poem: any, index: number) => (
          <Card key={index} title={poem.title} content={poem.content} />
        ))}
      </div>
      {price > 0 && (
        <button>Buy Collection - ${price}</button>
      )}
    </div>
  );
};

export default PublicCollectionPage;